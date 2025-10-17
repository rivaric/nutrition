import * as bcrypt from 'bcrypt';
import * as dayjs from 'dayjs';

import { ActivityLevel, Gender, GoalType, MealType, PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.meal.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('qwe', 10);

  const users = await prisma.user.createMany({
    data: [
      {
        name: 'Илья Кузнецов',
        email: 'ilya@example.com',
        password: hashedPassword,
        age: 25,
        gender: Gender.MALE,
        heightCm: 180,
        weightKg: 78,
        targetWeight: 75,
        activityLevel: ActivityLevel.MODERATELY_ACTIVE,
        goal: GoalType.LOSE_WEIGHT,
      },
      {
        name: 'Мария Иванова',
        email: 'maria@example.com',
        password: hashedPassword,
        age: 30,
        gender: Gender.FEMALE,
        heightCm: 165,
        weightKg: 60,
        targetWeight: 58,
        activityLevel: ActivityLevel.LIGHTLY_ACTIVE,
        goal: GoalType.MAINTAIN_WEIGHT,
      },
    ],
  });

  console.log(`👤 Created ${users.count} users`);

  const ilya = await prisma.user.findUnique({ where: { email: 'ilya@example.com' } });
  const maria = await prisma.user.findUnique({ where: { email: 'maria@example.com' } });

  if (!ilya || !maria) throw new Error('Users not found after creation');

  const now = dayjs();

  const meals = [
    {
      userId: ilya.id,
      name: 'Овсянка с фруктами',
      mealType: MealType.BREAKFAST,
      calories: 350,
      protein: 15,
      fat: 8,
      carbs: 55,
      description: 'Овсянка с бананом и медом',
      createdAt: now.subtract(6, 'day').toDate(),
    },
    {
      userId: ilya.id,
      name: 'Овсянка с фруктами',
      mealType: MealType.BREAKFAST,
      calories: 350,
      protein: 15,
      fat: 20,
      carbs: 55,
      description: 'Овсянка с бананом и медом 2',
      createdAt: now.subtract(6, 'day').toDate(),
    },
    {
      userId: ilya.id,
      name: 'Куриная грудка с рисом',
      mealType: MealType.LUNCH,
      calories: 600,
      protein: 45,
      fat: 10,
      carbs: 75,
      description: 'Полезный обед',
      createdAt: now.subtract(5, 'day').toDate(),
    },
    {
      userId: ilya.id,
      name: 'Омлет с овощами',
      mealType: MealType.BREAKFAST,
      calories: 300,
      protein: 20,
      fat: 12,
      carbs: 20,
      createdAt: now.subtract(3, 'day').toDate(),
    },
    {
      userId: ilya.id,
      name: 'Стейк с картошкой',
      mealType: MealType.DINNER,
      calories: 700,
      protein: 50,
      fat: 30,
      carbs: 60,
      createdAt: now.subtract(2, 'day').toDate(),
    },
    {
      userId: ilya.id,
      name: 'Протеиновый батончик',
      mealType: MealType.SNACK,
      calories: 220,
      protein: 20,
      fat: 8,
      carbs: 18,
      createdAt: now.subtract(1, 'day').toDate(),
    },
    {
      userId: maria.id,
      name: 'Йогурт с мюсли',
      mealType: MealType.BREAKFAST,
      calories: 250,
      protein: 10,
      fat: 5,
      carbs: 40,
      createdAt: now.subtract(6, 'day').toDate(),
    },
    {
      userId: maria.id,
      name: 'Салат с тунцом',
      mealType: MealType.LUNCH,
      calories: 400,
      protein: 30,
      fat: 15,
      carbs: 25,
      createdAt: now.subtract(4, 'day').toDate(),
    },
    {
      userId: maria.id,
      name: 'Овощное рагу',
      mealType: MealType.DINNER,
      calories: 500,
      protein: 20,
      fat: 18,
      carbs: 45,
      createdAt: now.subtract(2, 'day').toDate(),
    },
  ];

  await prisma.meal.createMany({ data: meals });

  console.log(`🍽 Created ${meals.length} meals`);
  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
