export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold">ERP Fotovoltaico</h1>
      <p className="mt-2 text-gray-600">
        Acesse{" "}
        <a href="/admin/catalogo" className="text-blue-600 underline">
          /admin/catalogo
        </a>{" "}
        para ver o catálogo de produtos.
      </p>
    </main>
  );
}
