import "server-only"

import ExcelJS from "exceljs"
import type { CellValue } from "exceljs"

export const STUDENT_IMPORT_COLUMNS = ["name", "email", "phone"] as const

export type ParsedStudentRow = {
  name: string
  email: string
  phone: string
}

export type StudentImportRowError = {
  row: number
  reason: string
}

export type ParsedStudentSheet = {
  students: ParsedStudentRow[]
  errors: StudentImportRowError[]
  duplicatesInFile: number
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const cellText = (value: CellValue): string => {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value.trim()
  if (typeof value === "number" || typeof value === "boolean")
    return String(value).trim()
  if (value instanceof Date) return value.toISOString().trim()

  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string")
      return value.text.trim()
    if ("richText" in value && Array.isArray(value.richText))
      return value.richText
        .map((part) => part.text)
        .join("")
        .trim()
    if ("result" in value) return cellText(value.result as CellValue)
  }

  return String(value).trim()
}

export const parseStudentsWorkbook = async (
  base64: string,
): Promise<ParsedStudentSheet> => {
  const workbook = new ExcelJS.Workbook()

  try {
    // exceljs ships its own Buffer typing, which does not line up with the
    // @types/node one; the value passed is a real Node Buffer either way.
    await workbook.xlsx.load(
      Buffer.from(base64, "base64") as unknown as Parameters<
        typeof workbook.xlsx.load
      >[0],
    )
  } catch {
    throw new Error(
      "The file could not be read. Please upload a valid .xlsx or .xls file.",
    )
  }

  const sheet = workbook.worksheets[0]
  if (!sheet) {
    throw new Error("The file has no sheets")
  }

  const headerRow = sheet.getRow(1)
  const columnIndex: Partial<
    Record<(typeof STUDENT_IMPORT_COLUMNS)[number], number>
  > = {}

  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const header = cellText(cell.value).toLowerCase()
    for (const column of STUDENT_IMPORT_COLUMNS) {
      if (header === column && columnIndex[column] === undefined) {
        columnIndex[column] = colNumber
      }
    }
  })

  const missing = STUDENT_IMPORT_COLUMNS.filter(
    (column) => columnIndex[column] === undefined,
  )

  if (missing.length > 0) {
    throw new Error(
      `The first row must have these column headers: ${STUDENT_IMPORT_COLUMNS.join(", ")}. Missing: ${missing.join(", ")}`,
    )
  }

  const students: ParsedStudentRow[] = []
  const errors: StudentImportRowError[] = []
  const seen = new Set<string>()
  let duplicatesInFile = 0

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber)

    const name = cellText(row.getCell(columnIndex.name as number).value)
    const email = cellText(row.getCell(columnIndex.email as number).value)
    const phone = cellText(row.getCell(columnIndex.phone as number).value)

    if (!name && !email && !phone) continue

    const missingFields = STUDENT_IMPORT_COLUMNS.filter(
      (column) => !{ name, email, phone }[column],
    )

    if (missingFields.length > 0) {
      errors.push({
        row: rowNumber,
        reason: `Missing ${missingFields.join(", ")}`,
      })
      continue
    }

    if (!EMAIL_REGEX.test(email)) {
      errors.push({ row: rowNumber, reason: `Invalid email "${email}"` })
      continue
    }

    const key = email.toLowerCase()
    if (seen.has(key)) {
      duplicatesInFile++
      continue
    }
    seen.add(key)

    students.push({ name, email, phone })
  }

  return { students, errors, duplicatesInFile }
}
