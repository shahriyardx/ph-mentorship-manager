import ExampleComponent from "@/components/example";

const page = () => {
  return (
    <div className="px-10 pt-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold">Fullstack Template</h1>
        <p className="mb-5">
          This is a nextjs template that uses tailwind, shadcn-ui, better-auth,
          prisma, and trpc
        </p>

        <ExampleComponent />
      </div>
    </div>
  );
};

export default page;
