# [Backstage](https://backstage.io)

This is your newly scaffolded Backstage App, Good Luck!

To start the app, run:

```sh
yarn install
yarn dev
```

# Postgres

Run a local postgres container

```shell
docker run --name bs-pg -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres
```

Connect to the container

```shell
docker exec -ti bs-pg psql -U postgres
```
