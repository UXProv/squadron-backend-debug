##Docker run command
docker build -t nest-boilerplate-mongo-auth .
docker run -p 3000:3000 nest-boilerplate-mongo-auth npm run start:dev