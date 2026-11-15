<?php

// Users of the SAML identity provider used by the integration tests (bin/integration-test.sh).
// "groups" is the attribute the group sync reads; "Role" tests a configurable attribute name.
$config = [
    'admin' => ['core:AdminPassword'],

    'example-userpass' => [
        'exampleauth:UserPass',
        'samlalice:samlPass1' => [
            'uid' => ['samlalice'],
            'email' => ['samlalice@example.org'],
            'groups' => ['Matomo Admins', 'Matomo Editors'],
            'Role' => ['matomo-role-analyst'],
        ],
        'samlbob:samlPass1' => [
            'uid' => ['samlbob'],
            'email' => ['samlbob@example.org'],
            'groups' => ['Matomo Editors'],
        ],
    ],
];
