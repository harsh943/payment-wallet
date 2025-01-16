- Clone the repo

```jsx
git clone https://github.com/harsh943/payment-wallet.git
```

- npm install
- Run postgres either locally or on the cloud 
- Go to `packages/db`
    - npx prisma migrate dev
    - npx prisma db seed
- Go to `apps/user-app` , run `npm run dev`