#!/bin/bash

until nc -z -v -w30 postgres 5432; do
  echo "Waiting for database connection..."
  sleep 1
done

echo "Database is up, running prisma db push"
pnpm prisma db push

pnpm run start:dev