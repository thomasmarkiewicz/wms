import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TerminusModule } from '@nestjs/terminus';
import { join } from 'path';
import { HealthController } from './health.controller';
import { PrismaService } from './prisma.service';
import { PrismaHealthIndicator } from './prisma.health';
import { AppResolver } from './app.resolver';

@Module({
  imports: [
    TerminusModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'api/src/schema.gql'),
      sortSchema: true,
      playground: true,
    }),
  ],
  controllers: [HealthController],
  providers: [PrismaService, PrismaHealthIndicator, AppResolver],
})
export class AppModule {}
