type GenerateKidHandler = {
  setPublicKey(value: string): void;
  execute(): string;
};

export function generateKid(publicKey: string): string {
  const bean = __.newBean<GenerateKidHandler>(
    'com.enonic.xp.app.users.publickey.GenerateKidHandler',
  );
  bean.setPublicKey(publicKey);
  return bean.execute();
}
