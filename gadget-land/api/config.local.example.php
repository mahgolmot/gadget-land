<?php
return [
    'app_env' => 'production',
    'app_url' => 'https://shop.example.com',
    'db' => [
        'host' => 'localhost',
        'port' => 3306,
        'name' => 'hostinguser_gadgetland_store',
        'user' => 'hostinguser_gadgetland_user',
        'pass' => 'CHANGE_ME',
    ],
    'session' => ['secure' => true],
    'payment' => ['driver' => 'sandbox'],
];
