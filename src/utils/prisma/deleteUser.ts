import { getPrisma } from "@/src/config/prisma";

const prisma = getPrisma();

export async function deleteUser(userId: number) {
  const deleteUser = prisma.user.delete({ where: { id: userId } });
  const deleteWithdrawalAddress = prisma.withdrawalAddress.deleteMany({
    where: { users: { none: {} } },
  });
  const deleteValidators = prisma.validator.deleteMany({
    where: { users: { none: {} } },
  });

  await prisma.$transaction([
    deleteUser,
    deleteWithdrawalAddress,
    deleteValidators,
  ]);
}
