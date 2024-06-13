import { prisma } from "@/db";


export default async function Campaign() {
    const clients = await prisma.client.findMany();

    return (
      <main className=" flex min-h-screen justify-center items-center bg-slate-50 ">
        <div className="bg-slate-300 rounded-3xl py-6  h-[400px] w-[450px] flex flex-col text-slate-800">
          <h1 className="text-3xl text-center">My clients</h1>
          <div className="mx-8 mt-4 mb-6">
            {clients.map((client) => (
              <div key={client.id} className="flex justify-between items-center mb-2">
                <div>{client.name}</div>
              </div>
            ))}
        </div>
        </div>
      </main>
    );
  }
  