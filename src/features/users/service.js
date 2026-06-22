import bcrypt from "bcrypt";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
export async function getUserProfile(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            referralCode: true,
            creditsBalance: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return user;
}
export async function updateUserProfile(userId, input) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new ApiError(404, "User not found");
    if (input.phone) {
        const phoneTaken = await prisma.user.findFirst({
            where: { phone: input.phone, NOT: { id: userId } },
        });
        if (phoneTaken) {
            throw new ApiError(409, "Phone number already in use");
        }
    }
    return prisma.user.update({
        where: { id: userId },
        data: {
            ...(input.name !== undefined ? { name: input.name } : {}),
            ...(input.phone !== undefined ? { phone: input.phone } : {}),
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            referralCode: true,
            creditsBalance: true,
            updatedAt: true,
        },
    });
}
export async function changeUserPassword(userId, input) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new ApiError(404, "User not found");
    const isMatch = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isMatch) {
        throw new ApiError(400, "Current password is incorrect");
    }
    const passwordHash = await bcrypt.hash(input.newPassword, 10);
    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
    });
    await prisma.refreshToken.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
    });
    return { message: "Password updated successfully" };
}
//# sourceMappingURL=service.js.map