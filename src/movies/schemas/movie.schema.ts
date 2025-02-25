import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MovieDocument = HydratedDocument<Movie>;

@Schema()
export class Movie {
  @Prop({ required: true })
  title: string;

  @Prop()
  year: number;

  @Prop()
  country: string;

  @Prop()
  language: string;

  @Prop()
  production_company: string;

  @Prop([String])
  directors: string[];

  @Prop([String])
  screenwriters: string[];

  @Prop([String])
  actors: string[];

  @Prop()
  description: string;

  @Prop([String])
  genres: string[];

  @Prop()
  runtime: number;

  @Prop({ default: 0 })
  __v: number;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);

