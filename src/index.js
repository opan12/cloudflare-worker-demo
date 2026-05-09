let notes = [];

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Not ekle
    if (url.pathname === "/add" && request.method === "POST") {
      const body = await request.json();

      const note = {
        id: Date.now(),
        text: body.text
      };

      notes.push(note);

      return Response.json({
        message: "Note added 🚀",
        note
      });
    }

    // Listele
    if (url.pathname === "/list") {
      return Response.json(notes);
    }

    // Sil
    if (url.pathname.startsWith("/delete")) {
      const id = Number(url.searchParams.get("id"));

      notes = notes.filter(n => n.id !== id);

      return Response.json({
        message: "Deleted"
      });
    }

    return new Response("Cloudflare Worker Note API çalışıyor 🚀");
  }
};