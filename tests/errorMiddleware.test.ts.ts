import supertest from "supertest";
import app from "../src/app";

describe("Middleware de erro", () => {
  it("deve retornar 500 para erros desconhecidos", async () => {
    const response = await supertest(app).get("/forca-erro").expect(500);

    expect(response.text).toBe("Erro desconhecido");
  });
});
