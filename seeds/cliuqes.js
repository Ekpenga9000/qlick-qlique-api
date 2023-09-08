/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('clique').del();

  // Inserts seed entries
  await knex('clique').insert([
    {
      id: 1,
      name: 'Tech Enthusiasts',
      description: 'A group for technology enthusiasts to discuss the latest trends in tech.',
      category: 'Technology',
      banner_url: '/images/cliqueBanner.png',
      user_id: 1,
      status: 'Active'
    },
    {
      id: 2,
      name: 'Outdoor Adventurers',
      description: 'For those who love hiking, camping, and all things outdoors.',
      category: 'Outdoors',
      banner_url: '/images/cliqueBanner.png',
      user_id: 2,
      status: 'Active'
    },
    // ... your other objects here
  ]);
};
