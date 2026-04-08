"use client"

import { SettingsSchema } from "@/schema"
import { trpc } from "@/trpc/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import type z from "zod"
import { useDiscord } from "@/hooks/useDiscord"
import { useEffect } from "react"

const SettingsForm = () => {
  const form = useForm({
    resolver: zodResolver(SettingsSchema),
  })

  const guildId = useWatch({
    control: form.control,
    name: "serverId",
  })

  const { data: settings } = trpc.admin.settings.useQuery()
  const { data: channels } = useDiscord({ entity: "channels", guildId })
  const { data: servers } = useDiscord({ entity: "servers" })
  const { mutate: updateSettings } = trpc.admin.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Settings updated successfully")
    },
  })

  useEffect(() => {
    if (settings) {
      form.reset(settings)
    }
  }, [settings, form])

  const handleSubmit = (values: z.infer<typeof SettingsSchema>) => {
    updateSettings(values)
  }

  return (
    <>
      {!settings && <p>Loading...</p>}
      {settings && (
        <form id="settings-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <Controller
              name="serverId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Discord Server</FieldLabel>

                  <MultiSelect
                    values={field.value ? [field.value] : undefined}
                    onValuesChange={(values) => field.onChange(values[0])}
                    single={true}
                  >
                    <MultiSelectTrigger>
                      <MultiSelectValue placeholder="Select a server" />
                    </MultiSelectTrigger>
                    <MultiSelectContent>
                      <MultiSelectGroup>
                        {servers.map((server) => (
                          <MultiSelectItem key={server.id} value={server.id}>
                            {server.name}
                          </MultiSelectItem>
                        ))}
                      </MultiSelectGroup>
                    </MultiSelectContent>
                  </MultiSelect>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="dashboardLogChannelId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Dashboard Log Channel
                  </FieldLabel>

                  <MultiSelect
                    values={field.value ? [field.value] : undefined}
                    onValuesChange={(values) => field.onChange(values[0])}
                    single={true}
                  >
                    <MultiSelectTrigger>
                      <MultiSelectValue placeholder="Select a channel" />
                    </MultiSelectTrigger>
                    <MultiSelectContent>
                      <MultiSelectGroup>
                        {channels.map((channel) => (
                          <MultiSelectItem key={channel.id} value={channel.id}>
                            {channel.name}
                          </MultiSelectItem>
                        ))}
                      </MultiSelectGroup>
                    </MultiSelectContent>
                  </MultiSelect>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      )}
    </>
  )
}

export default SettingsForm
