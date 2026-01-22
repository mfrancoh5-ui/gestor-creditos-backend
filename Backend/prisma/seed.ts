import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // Limpiar usuarios existentes (solo para desarrollo)
  await prisma.usuario.deleteMany();

  // Crear usuario ADMIN
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@gestor-creditos.local',
      passwordHash: adminPassword,
      nombres: 'Admin Local',
      rol: 'ADMIN',
      activo: true,
    },
  });

  console.log('✅ Usuario ADMIN creado:');
  console.log('   Email: admin@gestor-creditos.local');
  console.log('   Contraseña: admin123');
  console.log('   ID:', admin.id);

  // Crear usuario COBRADOR
  const cobradorPassword = await bcrypt.hash('cobrador123', 10);
  const cobrador = await prisma.usuario.create({
    data: {
      email: 'cobrador@gestor-creditos.local',
      passwordHash: cobradorPassword,
      nombres: 'Cobrador Local',
      rol: 'COBRADOR',
      activo: true,
    },
  });

  console.log('✅ Usuario COBRADOR creado:');
  console.log('   Email: cobrador@gestor-creditos.local');
  console.log('   Contraseña: cobrador123');
  console.log('   ID:', cobrador.id);

  // Crear usuario VIEWER
  const viewerPassword = await bcrypt.hash('viewer123', 10);
  const viewer = await prisma.usuario.create({
    data: {
      email: 'viewer@gestor-creditos.local',
      passwordHash: viewerPassword,
      nombres: 'Viewer Local',
      rol: 'VIEWER',
      activo: true,
    },
  });

  console.log('✅ Usuario VIEWER creado:');
  console.log('   Email: viewer@gestor-creditos.local');
  console.log('   Contraseña: viewer123');
  console.log('   ID:', viewer.id);

  // Crear algunos clientes de prueba
  const cliente1 = await prisma.cliente.create({
    data: {
      nombres: 'Juan',
      apellidos: 'Pérez',
      telefono: '555-1234',
      dni: '12345678',
      direccion: 'Calle Principal 123',
    },
  });

  const cliente2 = await prisma.cliente.create({
    data: {
      nombres: 'María',
      apellidos: 'García',
      telefono: '555-5678',
      dni: '87654321',
      direccion: 'Avenida Central 456',
    },
  });

  const cliente3 = await prisma.cliente.create({
    data: {
      nombres: 'Carlos',
      apellidos: 'López',
      telefono: '555-9999',
      dni: '11111111',
      direccion: 'Calle Secundaria 789',
    },
  });

  console.log('✅ Clientes de prueba creados:');
  console.log('   Cliente 1: Juan Pérez (ID:', cliente1.id, ')');
  console.log('   Cliente 2: María García (ID:', cliente2.id, ')');
  console.log('   Cliente 3: Carlos López (ID:', cliente3.id, ')');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✅ Seed completado');
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
