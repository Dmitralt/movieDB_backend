import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Types } from 'mongoose';
import * as sanitizeHtml from 'sanitize-html';

export function IsMongoId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isMongoId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return Types.ObjectId.isValid(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid MongoDB ObjectId`;
        },
      },
    });
  };
}

export function SanitizeHtml() {
  return function (target: any, propertyKey: string) {
    let value = target[propertyKey];

    const getter = function () {
      return value;
    };

    const setter = function (newVal: string) {
      if (typeof newVal === 'string') {
        value = sanitizeHtml(newVal, {
          allowedTags: [],
          allowedAttributes: {},
        });
      } else {
        value = newVal;
      }
    };

    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    });
  };
}

export function SanitizeArray() {
  return function (target: any, propertyKey: string) {
    let value = target[propertyKey];

    const getter = function () {
      return value;
    };

    const setter = function (newVal: string[]) {
      if (Array.isArray(newVal)) {
        value = newVal.map((item) =>
          typeof item === 'string'
            ? sanitizeHtml(item, {
                allowedTags: [],
                allowedAttributes: {},
              })
            : item,
        );
      } else {
        value = newVal;
      }
    };

    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    });
  };
}
