/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("table_name").del();
  await knex("table_name").insert([
    {
      id: 1,
      google_id: "112098870329704326847",
      firstname: "Omogbare",
      lastname: "Ekpenga",
      email: "ekpenga9000@gmail.com",
      phone_number: "123-000-556",
      date_of_birth: "2010-08-10",
      avatar_url: "/images/112098870329704326847.png",
      username: "ekpenga9000@gmail.com",
      display_name: "Omogbare Ekpenga",
      password_hash:
        "$2a$10$sOL0c3QSbdU5oKuB.GBVruACapfBbkTTa1fryWTpKM8fLYf1.nthK",
      bio: "🌟 Living my best life and making each moment count on Clique. Let's make memories and spread positivity! 💕",
      created_at: "2023-08-31 15:23:09",
      status: "Active",
    },
    {
      id: 2,
      google_id: null,
      firstname: "Emily",
      lastname: "Smith",
      email: "emily.smith@email.com",
      phone_number: "987-654-3210",
      date_of_birth: "2010-08-10",
      avatar_url: "images/avatar.png",
      username: "emily_smith85",
      display_name: "Emily Smith",
      password_hash:
        "$2a$10$L0i1llzQ6l38vKiM23oZ5O4ig8PEphbvWtlf.C5eRBbSaE0nmCfEC",
      bio: "🌟 Living my best life and making each moment count on Clique. Let's make memories and spread positivity! 💕",
      created_at: "2023-08-31 15:32:59",
      status: "Active",
    },
    {
      id: 3,
      google_id: "114641982406208167408",
      firstname: "Omogbare",
      lastname: "Ekpenga",
      email: "omo.softwaredev@gmail.com",
      phone_number: "987-654-3211",
      date_of_birth: "2010-08-10",
      avatar_url: "/images/114641982406208167408.png",
      username: "omo.softwaredev@gmail.com",
      display_name: "Omogbare Ekpenga",
      password_hash:
        "$2a$10$AEGcH6bCCFBlSR70VOWS1ex7vPOKg4FqdJhIp6Kl6NNlIpiRjbA3m",
      bio: "🌟 Living my best life and making each moment count on Clique. Let's make memories and spread positivity! 💕",
      created_at: "2023-08-31 16:40:33",
      status: "Active",
    }
  ]);
};
