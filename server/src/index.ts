import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { parse } from 'ts-command-line-args';

interface IArguments{
  port: number;
  instance: number;
}

export const args = parse<IArguments>({
  port: Number,
  instance: Number
});

dotenv.config();

const app: Express = express();

const port = args.port || process.env.BASE_PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send(`Pendulum Instance ${args.instance} Server ...`);
});

app.listen(port, () => {
  console.log(`[server]: Server instance ${args.instance} is running at http://localhost:${port}`);
});