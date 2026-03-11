# Testing Quick Reference Card

## 🚀 Common Commands

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:cov
```

### Run Tests with Verbose Output
```bash
npm test -- --verbose
```

### Run Tests in Debug Mode
```bash
npm run test:debug
```

## 🎯 Run Specific Tests

### By File Pattern
```bash
# Auth service tests
npm test -- --testPathPattern=auth.service.spec.ts

# App controller tests
npm test -- --testPathPattern=app.controller.spec.ts

# DB service tests
npm test -- --testPathPattern=db.service.spec.ts

# Users service tests
npm test -- --testPathPattern=users.service.spec.ts
```

### By Test Name
```bash
# Run specific test by name
npm test -- --testNamePattern="should return access token"

# Run all login tests
npm test -- --testNamePattern="login"

# Run all POST /posts tests
npm test -- --testNamePattern="POST /posts"
```

### Combined Filters
```bash
# Run specific test in specific file
npm test -- --testPathPattern=auth.service --testNamePattern="login"
```

## 📊 Coverage Commands

### Generate Coverage Report
```bash
npm run test:cov
```

### View HTML Coverage Report
```bash
npm run test:cov
# Open coverage/lcov-report/index.html in browser
```

### Coverage with Threshold
```bash
npm test -- --coverage --coverageThreshold='{"global":{"statements":80}}'
```

## 🔍 Test Results Summary

```
Test Suites: 4 passed, 4 total
Tests:       86 passed, 86 total
Time:        ~5.5 seconds
```

### Coverage Summary
```
File                  | % Stmts | % Branch | % Funcs | % Lines
----------------------|---------|----------|---------|--------
app.controller.ts     | 92%     | 100%     | 100%    | 91.3%
auth.service.ts       | 100%    | 100%     | 100%    | 100%
users.service.ts      | 100%    | 100%     | 100%    | 100%
db.service.ts         | 100%    | 100%     | 100%    | 100%
```

## 📝 Test Files

| File | Tests | Description |
|------|-------|-------------|
| `auth.service.spec.ts` | 9 | Authentication logic, JWT generation |
| `app.controller.spec.ts` | 43 | All API endpoints |
| `users.service.spec.ts` | 7 | User lookup, password validation |
| `db.service.spec.ts` | 27 | Database operations |

## 🎪 Test Categories

### Authentication (15 tests)
- Login endpoint (6 tests)
- Logout endpoint (4 tests)
- User validation (5 tests)

### Posts (26 tests)
- Create post (10 tests)
- Get posts (8 tests)
- Database operations (8 tests)

### Users (15 tests)
- Get users (8 tests)
- Find user (3 tests)
- Password validation (4 tests)

### Integration (2 tests)
- Multiple operations
- State management

## 🐛 Debug Tests

### Run Single Test in Debug Mode
```bash
npm run test:debug
# Open chrome://inspect in Chrome
# Click "inspect" on the Node process
```

### Add Breakpoints in Tests
```typescript
it('should do something', () => {
  debugger; // Execution will pause here
  const result = service.method();
  expect(result).toBe('expected');
});
```

### Console Output in Tests
```typescript
it('should do something', () => {
  console.log('Debug info:', variable);
  const result = service.method();
  expect(result).toBe('expected');
});
```

## ⚡ Quick Test Templates

### Controller Test
```typescript
it('should handle endpoint', async () => {
  const mockRequest = { user: { userId: '123' } };
  mockService.method.mockResolvedValue({ data: 'result' });
  
  const result = await controller.endpoint(mockRequest);
  
  expect(service.method).toHaveBeenCalled();
  expect(result).toEqual({ data: 'result' });
});
```

### Service Test
```typescript
it('should handle operation', async () => {
  mockDependency.method.mockResolvedValue('result');
  
  const result = await service.operation('input');
  
  expect(mockDependency.method).toHaveBeenCalledWith('input');
  expect(result).toBe('result');
});
```

### Error Test
```typescript
it('should handle error', async () => {
  mockService.method.mockRejectedValue(new Error('Failed'));
  
  await expect(service.operation()).rejects.toThrow('Failed');
});
```

## 🔧 Troubleshooting

### Tests Failing?
```bash
# Clear cache and run again
npm test -- --clearCache
npm test
```

### Timeout Issues?
```bash
# Increase timeout (default is 5000ms)
jest.setTimeout(10000);
```

### Mock Not Working?
```bash
# Ensure mocks are cleared
afterEach(() => {
  jest.clearAllMocks();
});
```

## 📚 Documentation

- **Full Test Results**: [TEST_RESULTS.md](./TEST_RESULTS.md)
- **Testing Guide**: [TEST_GUIDE.md](./TEST_GUIDE.md)
- **API Documentation**: [README.md](./README.md)

## 🎯 CI/CD Integration

### GitHub Actions
```yaml
- name: Run Tests
  run: |
    cd apps/api
    npm test
    npm run test:cov
```

### GitLab CI
```yaml
test:
  script:
    - cd apps/api
    - npm install
    - npm test
```

## 📈 Performance

| Operation | Time |
|-----------|------|
| All tests | ~5.5s |
| Auth tests | ~1.5s |
| Controller tests | ~2.0s |
| DB tests | ~1.5s |
| Users tests | ~0.5s |

## ✨ Tips

1. **Run tests before committing**
   ```bash
   npm test && git commit
   ```

2. **Watch mode for development**
   ```bash
   npm run test:watch
   ```

3. **Focus on failing tests**
   ```bash
   npm test -- --onlyFailures
   ```

4. **Run tests in parallel** (default)
   ```bash
   npm test -- --maxWorkers=4
   ```

5. **Run tests sequentially**
   ```bash
   npm test -- --runInBand
   ```

---

**Quick Start**: `npm test`  
**Total Tests**: 86  
**Success Rate**: 100%  
**Last Updated**: January 2025