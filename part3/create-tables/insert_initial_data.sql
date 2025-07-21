INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password`, `is_admin`) 
VALUES (
    '36c9050e-ddd3-4c3b-9731-9f487208bbc1',
    'Admin',
    'HBnB',
    'admin@hbnb.io',
    '$2b$12$VHvQlCJp4u6r24DoZYk4EupWELP5kgVxSPr02D5oscNon7xxRA7/m',
    1
);

INSERT INTO `amenities` (`id`, `name`) 
VALUES
    ('4104a0cc-3128-4639-8cbf-ebe56a32b84a', 'Wifi'),
    ('910da42e-cf77-44d6-8383-18bcb192961c', 'Swimming Pool'),
    ('a0de5556-c903-49ee-8104-e9a77303c7fc', 'Air Conditioning');
