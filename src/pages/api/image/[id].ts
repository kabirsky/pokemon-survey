// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { MAX_DEX_ID } from "@/constants";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = ReadableStream<Uint8Array> | null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const id = req.query.id as string;
  if (!(Number.parseInt(id) >= 1 && Number.parseInt(id) <= MAX_DEX_ID)) {
    res.status(400);
    return;
  }
  const data = await fetch(
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
  );
  res.send(data.body);
}
