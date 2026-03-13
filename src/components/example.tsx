"use client";

import { trpc } from "@/trpc/client";

const ExampleComponent = () => {
  const { data, isLoading } = trpc.example.hello.useQuery();

  return (
    <div>
      {isLoading
        ? "Data is loading..."
        : data
          ? data.message
          : "TRPC is not working"}
    </div>
  );
};

export default ExampleComponent;
