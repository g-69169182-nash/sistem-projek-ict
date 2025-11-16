import UsageForm from "../components/UsageForm";

export default function Home() {
  return (
    <main className="min-h-screen flex justify-center items-start py-10 px-4 bg-[#e9eefb]">
      <div className="w-full max-w-3xl">
        <UsageForm />
      </div>
    </main>
  );
}
