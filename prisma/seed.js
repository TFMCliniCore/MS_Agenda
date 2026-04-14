const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const MS_ENTIDADES_URL = process.env.MS_ENTIDADES_URL ?? 'http://localhost:3001/api/v1';

async function fetchPacientes() {
  const res = await fetch(`${MS_ENTIDADES_URL}/pacientes`);
  if (!res.ok) throw new Error(`Error al obtener pacientes de ms-entidades: ${res.status}`);
  return res.json();
}

async function fetchUsuarios() {
  const res = await fetch(`${MS_ENTIDADES_URL}/usuarios`);
  if (!res.ok) throw new Error(`Error al obtener usuarios de ms-entidades: ${res.status}`);
  return res.json();
}

async function seedCitas(pacientes, usuarios) {
  if (await prisma.cita.count()) {
    console.log('Citas ya existen, omitiendo seed.');
    return;
  }

  const paciente1 = pacientes[0];
  const paciente2 = pacientes[1];
  const paciente3 = pacientes[2];
  const usuario1  = usuarios[0];
  const usuario2  = usuarios[1];

  const citasBase = [
    {
      fecha:      new Date('2026-05-10T09:00:00'),
      motivo:     'Control mensual de peso y revision general.',
      tipo:       'Consulta',
      estado:     'NO_COMPLETADO',
      pacienteId: paciente1.id,
      clienteId:  paciente1.cliente.id,
      usuarioId:  usuario1.id,
    },
    {
      fecha:      new Date('2026-05-12T11:00:00'),
      motivo:     'Vacunacion antirabica anual.',
      tipo:       'Vacunacion',
      estado:     'NO_COMPLETADO',
      pacienteId: paciente2.id,
      clienteId:  paciente2.cliente.id,
      usuarioId:  usuario2.id,
    },
    {
      fecha:      new Date('2026-04-20T10:00:00'),
      motivo:     'Cirugia de esterilizacion programada.',
      tipo:       'Cirugia',
      estado:     'COMPLETADO',
      pacienteId: paciente3.id,
      clienteId:  paciente3.cliente.id,
      usuarioId:  usuario1.id,
    },
  ];

  for (const cita of citasBase) {
    await prisma.cita.create({ data: cita });
  }

  console.log(`Citas creadas: ${citasBase.length}`);
  return prisma.cita.findMany({ orderBy: { id: 'asc' } });
}

async function seedRecordatorios(pacientes, usuarios, citas) {
  if (await prisma.recordatorio.count()) {
    console.log('Recordatorios ya existen, omitiendo seed.');
    return;
  }

  const paciente1 = pacientes[0];
  const paciente2 = pacientes[1];
  const usuario1  = usuarios[0];

  const recordatoriosBase = [
    {
      motivo:     'Recordar al cliente sobre la cita de control mensual.',
      tipo:       'Consulta',
      estado:     'NO_COMPLETADO',
      fechaDesde: new Date('2026-05-08T08:00:00'),
      fechaHasta: new Date('2026-05-10T08:00:00'),
      pacienteId: paciente1.id,
      clienteId:  paciente1.cliente.id,
      usuarioId:  usuario1.id,
      citaId:     citas[0].id,
    },
    {
      motivo:     'Notificar sobre proxima vacunacion antirabica.',
      tipo:       'Vacunacion',
      estado:     'NO_COMPLETADO',
      fechaDesde: new Date('2026-05-10T08:00:00'),
      fechaHasta: new Date('2026-05-12T08:00:00'),
      pacienteId: paciente2.id,
      clienteId:  paciente2.cliente.id,
      usuarioId:  usuario1.id,
      citaId:     citas[1].id,
    },
    {
      motivo:     'Seguimiento post cirugia de esterilizacion.',
      tipo:       'Seguimiento',
      estado:     'NO_COMPLETADO',
      fechaDesde: new Date('2026-04-27T08:00:00'),
      fechaHasta: new Date('2026-05-04T08:00:00'),
      pacienteId: paciente2.id,
      clienteId:  paciente2.cliente.id,
      usuarioId:  usuario1.id,
      citaId:     null,
    },
  ];

  for (const recordatorio of recordatoriosBase) {
    await prisma.recordatorio.create({ data: recordatorio });
  }

  console.log(`Recordatorios creados: ${recordatoriosBase.length}`);
}

async function seedSalaEspera(pacientes, usuarios) {
  if (await prisma.salaEspera.count()) {
    console.log('Sala de espera ya tiene registros, omitiendo seed.');
    return;
  }

  const paciente1 = pacientes[0];
  const paciente2 = pacientes[1];
  const paciente3 = pacientes[2];
  const usuario1  = usuarios[0];
  const usuario2  = usuarios[1];

  const salaEsperaBase = [
    {
      hora:       new Date('2026-05-10T08:45:00'),
      motivo:     'Llego para consulta de control mensual.',
      pago:       false,
      llamar:     false,
      pacienteId: paciente1.id,
      clienteId:  paciente1.cliente.id,
      usuarioId:  usuario1.id,
    },
    {
      hora:       new Date('2026-05-10T09:10:00'),
      motivo:     'Vacunacion antirabica. Ya realizo el pago.',
      pago:       true,
      llamar:     false,
      pacienteId: paciente2.id,
      clienteId:  paciente2.cliente.id,
      usuarioId:  usuario2.id,
    },
    {
      hora:       new Date('2026-05-10T09:30:00'),
      motivo:     'Revision de herida post operatoria.',
      pago:       true,
      llamar:     true,
      pacienteId: paciente3.id,
      clienteId:  paciente3.cliente.id,
      usuarioId:  usuario1.id,
    },
  ];

  for (const entrada of salaEsperaBase) {
    await prisma.salaEspera.create({ data: entrada });
  }

  console.log(`Entradas de sala de espera creadas: ${salaEsperaBase.length}`);
}

async function main() {
  console.log('Iniciando seed de ms-agenda...');
  console.log(`Conectando a ms-entidades en: ${MS_ENTIDADES_URL}`);

  const [pacientes, usuarios] = await Promise.all([
    fetchPacientes(),
    fetchUsuarios(),
  ]);

  if (pacientes.length < 3 || usuarios.length < 2) {
    throw new Error(
      'ms-entidades no tiene suficientes datos. Asegurate de correr el seed de ms-entidades primero.'
    );
  }

  console.log(`Pacientes encontrados: ${pacientes.length}`);
  console.log(`Usuarios encontrados: ${usuarios.length}`);

  const citas = await seedCitas(pacientes, usuarios);
  await seedRecordatorios(pacientes, usuarios, citas ?? await prisma.cita.findMany({ orderBy: { id: 'asc' } }));
  await seedSalaEspera(pacientes, usuarios);

  console.log('Seed de ms-agenda completado exitosamente.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Error ejecutando el seed de ms-agenda:', error);
    await prisma.$disconnect();
    process.exit(1);
  });