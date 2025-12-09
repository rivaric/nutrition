import * as bcrypt from 'bcrypt';
import * as dayjs from 'dayjs';

import { ActivityLevel, Gender, GoalType, MealType, PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

const food101Dishes: {
  slug: string;
  name: string;
  category:
    | 'dessert'
    | 'meat'
    | 'salad'
    | 'soup'
    | 'pasta'
    | 'sandwich'
    | 'seafood'
    | 'breakfast'
    | 'snack'
    | 'other';
}[] = [
  { slug: 'apple_pie', name: 'Яблочный пирог', category: 'dessert' },
  { slug: 'baby_back_ribs', name: 'Свинина на ребрышках (baby back ribs)', category: 'meat' },
  { slug: 'baklava', name: 'Пахлава', category: 'dessert' },
  { slug: 'beef_carpaccio', name: 'Карпаччо из говядины', category: 'meat' },
  { slug: 'beef_tartare', name: 'Тартар из говядины', category: 'meat' },
  { slug: 'beet_salad', name: 'Свекольный салат', category: 'salad' },
  { slug: 'beignets', name: 'Бенье (французские пончики)', category: 'dessert' },
  { slug: 'bibimbap', name: 'Пибимпап (корейский рис с овощами и мясом)', category: 'other' },
  { slug: 'bread_pudding', name: 'Хлебный пудинг', category: 'dessert' },
  { slug: 'breakfast_burrito', name: 'Завтрак буррито', category: 'breakfast' },
  { slug: 'bruschetta', name: 'Брускетта', category: 'snack' },
  { slug: 'caesar_salad', name: 'Салат Цезарь', category: 'salad' },
  { slug: 'cannoli', name: 'Канноли', category: 'dessert' },
  { slug: 'caprese_salad', name: 'Салат Капрезе', category: 'salad' },
  { slug: 'carrot_cake', name: 'Морковный торт', category: 'dessert' },
  { slug: 'ceviche', name: 'Севиче', category: 'seafood' },
  { slug: 'cheesecake', name: 'Чизкейк', category: 'dessert' },
  { slug: 'cheese_plate', name: 'Сырная тарелка', category: 'snack' },
  { slug: 'chicken_curry', name: 'Куриный карри', category: 'meat' },
  { slug: 'chicken_quesadilla', name: 'Кесадилья с курицей', category: 'sandwich' },
  { slug: 'chicken_wings', name: 'Куриные крылышки', category: 'meat' },
  { slug: 'chocolate_cake', name: 'Шоколадный торт', category: 'dessert' },
  { slug: 'chocolate_mousse', name: 'Шоколадный мусс', category: 'dessert' },
  { slug: 'churros', name: 'Чуррос', category: 'dessert' },
  { slug: 'clam_chowder', name: 'Клэм-чаудер (суп из моллюсков)', category: 'soup' },
  { slug: 'club_sandwich', name: 'Клаб-сэндвич', category: 'sandwich' },
  { slug: 'crab_cakes', name: 'Крабовые котлеты', category: 'seafood' },
  { slug: 'creme_brulee', name: 'Крем-брюле', category: 'dessert' },
  { slug: 'croque_madame', name: 'Крок-мадам (горячий бутерброд)', category: 'sandwich' },
  { slug: 'cup_cakes', name: 'Капкейки', category: 'dessert' },
  { slug: 'deviled_eggs', name: 'Фаршированные яйца', category: 'snack' },
  { slug: 'donuts', name: 'Пончики', category: 'dessert' },
  { slug: 'dumplings', name: 'Пельмени / димсам', category: 'other' },
  { slug: 'edamame', name: 'Соевые стручки (эдамаме)', category: 'snack' },
  { slug: 'eggs_benedict', name: 'Яйца Бенедикт', category: 'breakfast' },
  { slug: 'escargots', name: 'Эскарго (улитки)', category: 'seafood' },
  { slug: 'falafel', name: 'Фалафель', category: 'other' },
  { slug: 'filet_mignon', name: 'Филе миньон', category: 'meat' },
  { slug: 'fish_and_chips', name: 'Фиш энд чипс (рыба с картофелем)', category: 'seafood' },
  { slug: 'foie_gras', name: 'Фуа-гра', category: 'meat' },
  { slug: 'french_fries', name: 'Картофель фри', category: 'snack' },
  { slug: 'french_onion_soup', name: 'Французский луковый суп', category: 'soup' },
  { slug: 'french_toast', name: 'Французские тосты', category: 'breakfast' },
  { slug: 'fried_calamari', name: 'Жареные кальмары', category: 'seafood' },
  { slug: 'fried_rice', name: 'Жареный рис', category: 'other' },
  { slug: 'frozen_yogurt', name: 'Замороженный йогурт', category: 'dessert' },
  { slug: 'garlic_bread', name: 'Чесночный хлеб', category: 'snack' },
  { slug: 'gnocchi', name: 'Ньокки', category: 'pasta' },
  { slug: 'greek_salad', name: 'Греческий салат', category: 'salad' },
  { slug: 'grilled_cheese_sandwich', name: 'Горячий сэндвич с сыром', category: 'sandwich' },
  { slug: 'grilled_salmon', name: 'Запечённый лосось', category: 'seafood' },
  { slug: 'guacamole', name: 'Гуакамоле', category: 'snack' },
  { slug: 'gyoza', name: 'Гёдза (японские пельмени)', category: 'other' },
  { slug: 'hamburger', name: 'Гамбургер', category: 'sandwich' },
  { slug: 'hot_and_sour_soup', name: 'Кисло-острый суп', category: 'soup' },
  { slug: 'hot_dog', name: 'Хот-дог', category: 'sandwich' },
  { slug: 'huevos_rancheros', name: 'Яйца ранчеро', category: 'breakfast' },
  { slug: 'hummus', name: 'Хумус', category: 'snack' },
  { slug: 'ice_cream', name: 'Мороженое', category: 'dessert' },
  { slug: 'lasagna', name: 'Лазанья', category: 'pasta' },
  { slug: 'lobster_bisque', name: 'Лобстер-биск (сливочный суп)', category: 'soup' },
  { slug: 'lobster_roll_sandwich', name: 'Сэндвич с лобстером', category: 'sandwich' },
  { slug: 'macaroni_and_cheese', name: 'Макароны с сыром (mac and cheese)', category: 'pasta' },
  { slug: 'macarons', name: 'Макарон (французское печенье)', category: 'dessert' },
  { slug: 'miso_soup', name: 'Мисо-суп', category: 'soup' },
  { slug: 'mussels', name: 'Мидии', category: 'seafood' },
  { slug: 'nachos', name: 'Начос', category: 'snack' },
  { slug: 'omelette', name: 'Омлет', category: 'breakfast' },
  { slug: 'onion_rings', name: 'Луковые кольца', category: 'snack' },
  { slug: 'oysters', name: 'Устрицы', category: 'seafood' },
  { slug: 'pad_thai', name: 'Пад тай', category: 'other' },
  { slug: 'paella', name: 'Паэлья', category: 'seafood' },
  { slug: 'pancakes', name: 'Блинчики / панкейки', category: 'breakfast' },
  { slug: 'panna_cotta', name: 'Панна-котта', category: 'dessert' },
  { slug: 'peking_duck', name: 'Утка по-пекински', category: 'meat' },
  { slug: 'pho', name: 'Фо (вьетнамский суп)', category: 'soup' },
  { slug: 'pizza', name: 'Пицца', category: 'other' },
  { slug: 'pork_chop', name: 'Свиная отбивная', category: 'meat' },
  { slug: 'poutine', name: 'Путин (картофель фри с соусом и сыром)', category: 'other' },
  { slug: 'prime_rib', name: 'Прайм-риб (говяжий стейк)', category: 'meat' },
  { slug: 'pulled_pork_sandwich', name: 'Сэндвич с тушёной свининой', category: 'sandwich' },
  { slug: 'ramen', name: 'Рамен', category: 'soup' },
  { slug: 'ravioli', name: 'Равиоли', category: 'pasta' },
  { slug: 'red_velvet_cake', name: 'Торт Красный бархат', category: 'dessert' },
  { slug: 'risotto', name: 'Ризотто', category: 'other' },
  { slug: 'samosa', name: 'Самоса', category: 'snack' },
  { slug: 'sashimi', name: 'Сашими', category: 'seafood' },
  { slug: 'scallops', name: 'Гребешки', category: 'seafood' },
  { slug: 'seaweed_salad', name: 'Салат из морской капусты', category: 'salad' },
  { slug: 'shrimp_and_grits', name: 'Креветки с кукурузной кашей (grits)', category: 'seafood' },
  { slug: 'spaghetti_bolognese', name: 'Спагетти Болоньезе', category: 'pasta' },
  { slug: 'spaghetti_carbonara', name: 'Спагетти Карбонара', category: 'pasta' },
  { slug: 'spring_rolls', name: 'Спринг-роллы', category: 'snack' },
  { slug: 'steak', name: 'Стейк', category: 'meat' },
  { slug: 'strawberry_shortcake', name: 'Клубничный бисквитный торт', category: 'dessert' },
  { slug: 'sushi', name: 'Суши', category: 'seafood' },
  { slug: 'tacos', name: 'Тако', category: 'other' },
  { slug: 'takoyaki', name: 'Такояки', category: 'snack' },
  { slug: 'tiramisu', name: 'Тирамису', category: 'dessert' },
  { slug: 'tuna_tartare', name: 'Тартар из тунца', category: 'seafood' },
  { slug: 'waffles', name: 'Вафли', category: 'breakfast' },
];

function getMacrosForCategory(category: (typeof food101Dishes)[number]['category']) {
  switch (category) {
    case 'meat':
      return { calories: 250, protein: 26, fat: 15, carbs: 2 };
    case 'seafood':
      return { calories: 190, protein: 22, fat: 10, carbs: 3 };
    case 'salad':
      return { calories: 120, protein: 4, fat: 7, carbs: 10 };
    case 'soup':
      return { calories: 80, protein: 5, fat: 3, carbs: 8 };
    case 'pasta':
      return { calories: 170, protein: 6, fat: 5, carbs: 25 };
    case 'sandwich':
      return { calories: 240, protein: 12, fat: 11, carbs: 24 };
    case 'breakfast':
      return { calories: 210, protein: 9, fat: 9, carbs: 27 };
    case 'snack':
      return { calories: 220, protein: 5, fat: 12, carbs: 24 };
    case 'dessert':
      return { calories: 320, protein: 4, fat: 18, carbs: 36 };
    case 'other':
    default:
      return { calories: 230, protein: 8, fat: 9, carbs: 27 };
  }
}

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.meal.deleteMany();
  await prisma.user.deleteMany();
  await prisma.dish.deleteMany();

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

  // Seed dishes from Food-101 classes
  const dishData = food101Dishes.map((d) => {
    const macros = getMacrosForCategory(d.category);
    return {
      slug: d.slug,
      name: d.name,
      calories: macros.calories,
      protein: macros.protein,
      fat: macros.fat,
      carbs: macros.carbs,
    };
  });

  await prisma.dish.createMany({ data: dishData });
  console.log(`🍛 Created ${dishData.length} dishes`);

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
