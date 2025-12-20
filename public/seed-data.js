window.__SEED_DATA = {
  "user_profiles": [
    {
      "id": "user_1",
      "email": "alice@example.com",
      "full_name": "Alice Example",
      "role": "user",
      "avatar_url": "/avatars/alice.png",
      "created_at": "2025-12-20T22:00:09.810Z"
    },
    {
      "id": "user_2",
      "email": "bob@example.com",
      "full_name": "Bob Admin",
      "role": "admin",
      "avatar_url": "/avatars/bob.png",
      "created_at": "2025-12-20T22:00:09.810Z"
    },
    {
      "id": "user_3",
      "email": "carol@example.com",
      "full_name": "Carol Tester",
      "role": "user",
      "avatar_url": "/avatars/carol.png",
      "created_at": "2025-12-20T22:00:09.810Z"
    },
    {
      "id": "user_4",
      "email": "dave@example.com",
      "full_name": "Dave Dev",
      "role": "developer",
      "avatar_url": "/avatars/dave.png",
      "created_at": "2025-12-20T22:00:09.810Z"
    }
  ],
  "subscriptions": [
    {
      "id": "sub_1",
      "user_email": "alice@example.com",
      "model_name": "Luna",
      "subscription_price": "9.99",
      "payment_status": "completed",
      "subscription_start_date": "2025-12-20T22:00:09.810Z",
      "subscription_end_date": "2026-01-19T22:00:09.810Z"
    },
    {
      "id": "sub_2",
      "user_email": "carol@example.com",
      "model_name": "Orion",
      "subscription_price": "4.99",
      "payment_status": "trialing",
      "subscription_start_date": "2025-12-20T22:00:09.810Z",
      "subscription_end_date": "2026-01-19T22:00:09.810Z"
    }
  ],
  "chat_sessions": [
    {
      "id": "chat_1",
      "user_email": "alice@example.com",
      "model_name": "Luna",
      "created_at": "2025-12-20T22:00:09.810Z",
      "last_message": "Hello, Luna!"
    },
    {
      "id": "chat_2",
      "user_email": "carol@example.com",
      "model_name": "Orion",
      "created_at": "2025-12-20T22:00:09.810Z",
      "last_message": "Tell me about the cosmos."
    }
  ],
  "chat_messages": [
    {
      "id": "msg_1",
      "session_id": "chat_1",
      "role": "user",
      "content": "Hi!",
      "created_at": "2025-12-20T22:00:09.810Z"
    },
    {
      "id": "msg_2",
      "session_id": "chat_1",
      "role": "assistant",
      "content": "Hello! How can I help?",
      "created_at": "2025-12-20T22:00:09.810Z"
    }
  ],
  "saved_images": [
    {
      "id": "img_1",
      "user_email": "alice@example.com",
      "image_url": "/images/sample1.jpg",
      "prompt": "A beautiful portrait",
      "created_at": "2025-12-20T22:00:09.810Z"
    },
    {
      "id": "img_2",
      "user_email": "dave@example.com",
      "image_url": "/images/sample2.jpg",
      "prompt": "A retro sci-fi poster",
      "created_at": "2025-12-20T22:00:09.810Z"
    }
  ],
  "email_logs": [
    {
      "id": "email_1",
      "to": "alice@example.com",
      "subject": "Welcome",
      "body": "Welcome to the app",
      "sent_at": "2025-12-20T22:00:09.810Z"
    }
  ]
};