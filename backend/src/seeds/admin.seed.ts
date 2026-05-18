import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';

const ADMIN_USER = {
  email: 'admin@gmail.com',
  password: '123456',
  role: Role.ADMIN,
  fullName: 'Admin User',
};

async function seedAdmin() {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);
  const hashedPassword = await bcrypt.hash(
    ADMIN_USER.password,
    10,
  );
  const existingAdmin = await userRepository.findOne({
    where: {
      email: ADMIN_USER.email,
    },
  });

  if (existingAdmin) {
    existingAdmin.password = hashedPassword;
    existingAdmin.role = ADMIN_USER.role;
    existingAdmin.fullName = ADMIN_USER.fullName;

    await userRepository.save(existingAdmin);
    console.log('Admin user updated: admin@gmail.com');
  } else {
    await userRepository.save(
      userRepository.create({
        email: ADMIN_USER.email,
        password: hashedPassword,
        role: ADMIN_USER.role,
        fullName: ADMIN_USER.fullName,
      }),
    );
    console.log('Admin user created: admin@gmail.com');
  }

  await AppDataSource.destroy();
}

seedAdmin().catch(async (error) => {
  console.error('Failed to seed admin user:', error);

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }

  process.exit(1);
});
