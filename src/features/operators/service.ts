import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";

const SALT_ROUNDS = 10;

const operatorUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
} as const;

type CreateOperatorInput = {
  companyName: string;
  contactEmail?: string;
  contactPhone?: string;
  operatorUser: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  };
};

type UpdateOperatorInput = {
  name?: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
};

function formatOperator(
  operator: {
    id: number;
    name: string;
    contactEmail: string | null;
    contactPhone: string | null;
    createdAt: Date;
    updatedAt: Date;
    users: {
      id: number;
      name: string;
      email: string;
      phone: string | null;
      role: UserRole;
    }[];
    _count?: { buses: number };
    buses?: unknown[];
  },
  includeBuses = false,
) {
  const { users, _count, buses, ...rest } = operator;
  return {
    ...rest,
    users,
    busCount: _count?.buses ?? 0,
    ...(includeBuses ? { buses } : {}),
  };
}

export async function createOperator(input: CreateOperatorInput) {
  const { operatorUser } = input;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: operatorUser.email },
        { phone: operatorUser.phone || "" },
      ],
    },
  });

  if (existing) {
    throw new ApiError(409, "User with this email or phone already exists");
  }

  const passwordHash = await bcrypt.hash(operatorUser.password, SALT_ROUNDS);
  const referralCode = `OPR${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return prisma.$transaction(async (tx) => {
    const busOperator = await tx.busOperator.create({
      data: {
        name: input.companyName,
        contactEmail: input.contactEmail ?? null,
        contactPhone: input.contactPhone ?? null,
      },
    });

    const user = await tx.user.create({
      data: {
        name: operatorUser.name,
        email: operatorUser.email,
        phone: operatorUser.phone ?? null,
        passwordHash,
        role: UserRole.OPERATOR,
        busOperatorId: busOperator.id,
        referralCode,
      },
      select: operatorUserSelect,
    });

    return {
      operator: {
        id: busOperator.id,
        name: busOperator.name,
        contactEmail: busOperator.contactEmail,
        contactPhone: busOperator.contactPhone,
        createdAt: busOperator.createdAt,
        updatedAt: busOperator.updatedAt,
      },
      user,
    };
  });
}

export async function listOperators() {
  const operators = await prisma.busOperator.findMany({
    include: {
      users: {
        where: { role: UserRole.OPERATOR },
        select: operatorUserSelect,
      },
      _count: {
        select: { buses: true },
      },
    },
    orderBy: { id: "asc" },
  });

  return operators.map((operator) => formatOperator(operator));
}

export async function getOperatorById(id: number) {
  const operator = await prisma.busOperator.findUnique({
    where: { id },
    include: {
      users: {
        where: { role: UserRole.OPERATOR },
        select: operatorUserSelect,
      },
      buses: true,
      _count: {
        select: { buses: true },
      },
    },
  });

  if (!operator) {
    throw new ApiError(404, "Operator not found");
  }

  return formatOperator(operator, true);
}

export async function updateOperator(id: number, input: UpdateOperatorInput) {
  const operator = await prisma.busOperator.findUnique({ where: { id } });

  if (!operator) {
    throw new ApiError(404, "Operator not found");
  }

  const updated = await prisma.busOperator.update({
    where: { id },
    data: {
      name: input.name ?? operator.name,
      contactEmail:
        input.contactEmail !== undefined
          ? input.contactEmail
          : operator.contactEmail,
      contactPhone:
        input.contactPhone !== undefined
          ? input.contactPhone
          : operator.contactPhone,
    },
    include: {
      users: {
        where: { role: UserRole.OPERATOR },
        select: operatorUserSelect,
      },
      _count: {
        select: { buses: true },
      },
    },
  });

  return formatOperator(updated);
}
