import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ExecutionContext } from '@nestjs/common';

class MockThrottlerGuard extends ThrottlerGuard {
  private requestCount = 0;
  private lastRequestTime = Date.now();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastRequestTime > 1000) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }

    this.requestCount++;
    return this.requestCount <= 2;
  }
}

describe('ThrottlerGuard', () => {
  let guard: MockThrottlerGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({
          throttlers: [
            {
              ttl: 1000,
              limit: 2,
            },
          ],
        }),
      ],
      providers: [
        {
          provide: ThrottlerGuard,
          useClass: MockThrottlerGuard,
        },
      ],
    }).compile();

    guard = module.get<MockThrottlerGuard>(ThrottlerGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow requests within the limit', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          ip: '127.0.0.1',
          url: '/test',
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    const firstResult = await guard.canActivate(context);
    expect(firstResult).toBe(true);

    const secondResult = await guard.canActivate(context);
    expect(secondResult).toBe(true);
  });

  it('should block requests exceeding the limit', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          ip: '127.0.0.1',
          url: '/test',
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    await guard.canActivate(context);
    await guard.canActivate(context);

    const thirdResult = await guard.canActivate(context);
    expect(thirdResult).toBe(false);
  });

  it('should reset the counter after ttl expires', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          ip: '127.0.0.1',
          url: '/test',
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    await guard.canActivate(context);
    await guard.canActivate(context);

    await new Promise((resolve) => setTimeout(resolve, 1100));

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  }, 2000);
});
