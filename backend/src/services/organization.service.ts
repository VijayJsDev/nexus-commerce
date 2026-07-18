import prisma from '../prisma';

export const createOrganization = async (data: {
  name: string;
  slug: string;
  email: string;
  phone?: string;
}) => {
  return await prisma.organization.create({
    data,
  });
};

export const getOrganizations = async () => {
  return await prisma.organization.findMany();
};

export const getOrganizationById = async (id: string) => {
  return await prisma.organization.findUnique({
    where: { id },
  });
};

export const getOrganizationBySlug = async (slug: string) => {
  return await prisma.organization.findUnique({
    where: { slug },
  });
};
