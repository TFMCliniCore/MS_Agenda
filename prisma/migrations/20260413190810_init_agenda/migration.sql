-- CreateTable
CREATE TABLE "citas" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "motivo" VARCHAR(500) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'NO_COMPLETADO',
    "eliminado" BOOLEAN NOT NULL DEFAULT false,
    "pacienteId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "recordatorioId" INTEGER,

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recordatorios" (
    "id" SERIAL NOT NULL,
    "motivo" VARCHAR(500) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'NO_COMPLETADO',
    "eliminado" BOOLEAN NOT NULL DEFAULT false,
    "fechaDesde" TIMESTAMP(3) NOT NULL,
    "fechaHasta" TIMESTAMP(3) NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "citaId" INTEGER,

    CONSTRAINT "recordatorios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sala_espera" (
    "id" SERIAL NOT NULL,
    "hora" TIMESTAMP(3) NOT NULL,
    "motivo" VARCHAR(500) NOT NULL,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "llamar" BOOLEAN NOT NULL DEFAULT false,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,
    "pacienteId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "usuarioId" INTEGER,

    CONSTRAINT "sala_espera_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "recordatorios" ADD CONSTRAINT "recordatorios_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "citas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
