import { IS_PUBLIC_KEY, Public } from './public.decorator';

describe('Public Decorator', () => {
  it('should set IS_PUBLIC_KEY metadata to true', () => {
    const decorator = Public();

    const target = class TestClass {};
    decorator(target, undefined, undefined);

    const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, target) as boolean;
    expect(metadata).toBe(true);
  });

  it('should export IS_PUBLIC_KEY constant', () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });
});
