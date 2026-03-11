# Testing Guide for Login Endpoint

This guide explains how to run and write unit tests for the login endpoint and authentication system in the Industrialisasi API.

## Table of Contents

1. [Overview](#overview)
2. [Test Setup](#test-setup)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Login Endpoint Tests](#login-endpoint-tests)
6. [Writing New Tests](#writing-new-tests)
7. [Best Practices](#best-practices)

## Overview

The API uses **Jest** as the testing framework with **@nestjs/testing** utilities for unit testing. The tests follow NestJS best practices with proper dependency injection mocking.

### Test Files

- `src/auth/auth.service.spec.ts` - Tests for authentication service (login logic, JWT generation)
- `src/app.controller.spec.ts` - Tests for login endpoint controller
- `src/users/users.service.spec.ts` - Tests for user service (user lookup, password validation)

## Test Setup

### Prerequisites

Make sure you have the necessary dependencies installed:

```bash
npm install
```

### Test Dependencies

The following packages are used for testing:

- `jest` - Testing framework
- `@nestjs/testing` - NestJS testing utilities
- `@types/jest` - TypeScript definitions
- `ts-jest` - TypeScript support for Jest

## Running Tests

### Run All Unit Tests

```bash
cd apps/api
npm test
```

### Run Specific Test File

```bash
# Run auth service tests
npm test -- --testPathPattern=auth.service.spec.ts

# Run controller tests
npm test -- --testPathPattern=app.controller.spec.ts

# Run users service tests
npm test -- --testPathPattern=users.service.spec.ts
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:cov
```

### Run Tests in Debug Mode

```bash
npm run test:debug
```

## Test Structure

### Unit Test Anatomy

```typescript
describe('ComponentName', () => {
  let service: ServiceType;
  let mockDependency: MockType;

  // Setup before each test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceName,
        {
          provide: DependencyName,
          useValue: mockDependency,
        },
      ],
    }).compile();

    service = module.get<ServiceType>(ServiceName);
  });

  // Cleanup after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test cases
  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = service.doSomething(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

## Login Endpoint Tests

### AuthService Tests (src/auth/auth.service.spec.ts)

The auth service tests cover:

#### 1. **validateUser()**
- ✅ Returns user without password when credentials are valid
- ✅ Returns null when user is not found
- ✅ Returns null when password is invalid
- ✅ Handles edge cases (empty username, empty password)

```typescript
it('should return user without password when credentials are valid', async () => {
  const mockUser = {
    userId: '123',
    username: 'testuser',
    password: 'hashedPassword123',
  };

  mockUsersService.findOne.mockResolvedValue(mockUser);
  mockUsersService.validatePassword.mockResolvedValue(true);

  const result = await authService.validateUser('testuser', 'password123');

  expect(result).toEqual({
    userId: '123',
    username: 'testuser',
  });
  expect(result).not.toHaveProperty('password');
});
```

#### 2. **login()**
- ✅ Returns access token for valid user
- ✅ Creates JWT payload with correct structure (username, sub)
- ✅ Handles user objects with additional properties

```typescript
it('should return an access token for valid user', async () => {
  const mockUser = {
    userId: '123',
    username: 'testuser',
  };

  const mockToken = 'jwt.token.here';
  mockJwtService.sign.mockReturnValue(mockToken);

  const result = await authService.login(mockUser);

  expect(jwtService.sign).toHaveBeenCalledWith({
    username: 'testuser',
    sub: '123',
  });
  expect(result).toEqual({
    access_token: mockToken,
  });
});
```

### AppController Tests (src/app.controller.spec.ts)

The controller tests cover the HTTP endpoint layer:

#### 1. **login()**
- ✅ Returns access token when login is successful
- ✅ Calls authService.login with correct user object
- ✅ Handles user object with additional properties
- ✅ Propagates errors from authService

```typescript
it('should return access token when login is successful', async () => {
  const mockUser = {
    userId: '123',
    username: 'testuser',
  };

  const mockRequest = {
    user: mockUser,
  };

  const mockToken = {
    access_token: 'jwt.token.here',
  };

  mockAuthService.login.mockResolvedValue(mockToken);

  const result = await appController.login(mockRequest);

  expect(authService.login).toHaveBeenCalledWith(mockUser);
  expect(result).toEqual(mockToken);
});
```

#### 2. **Other Endpoints**
- ✅ logout() - Calls logout on request object
- ✅ getProfile() - Returns user from request
- ✅ createPost() - Creates post with user ID
- ✅ getPosts() - Returns all posts
- ✅ getUsers() - Returns all users

### UsersService Tests (src/users/users.service.spec.ts)

Tests the database layer and password validation:

#### 1. **findOne()**
- ✅ Returns user when found in database
- ✅ Returns null when user is not found
- ✅ Handles database errors gracefully

```typescript
it('should return user when found', async () => {
  const mockUser = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    hashed_password: 'hashedpass123',
  };

  mockConnection.query.mockResolvedValueOnce({
    rows: [mockUser],
    rowCount: 1,
  });

  const result = await service.findOne('testuser');

  expect(result).toEqual({
    userId: '123',
    username: 'testuser',
    password: 'hashedpass123',
  });
});
```

#### 2. **validatePassword()**
- ✅ Returns true when password matches
- ✅ Returns false when password does not match
- ✅ Handles validation errors

## Writing New Tests

### Example: Testing a New Endpoint

1. **Create the test file** (e.g., `feature.service.spec.ts`)

2. **Import dependencies**:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';
```

3. **Set up mocks**:
```typescript
const mockDependency = {
  method: jest.fn(),
};
```

4. **Create test module**:
```typescript
beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      YourService,
      {
        provide: DependencyName,
        useValue: mockDependency,
      },
    ],
  }).compile();

  service = module.get<YourService>(YourService);
});
```

5. **Write test cases**:
```typescript
describe('methodName', () => {
  it('should handle success case', async () => {
    mockDependency.method.mockResolvedValue(expectedValue);
    
    const result = await service.methodName(input);
    
    expect(result).toEqual(expectedValue);
    expect(mockDependency.method).toHaveBeenCalledWith(input);
  });

  it('should handle error case', async () => {
    mockDependency.method.mockRejectedValue(new Error('Failed'));
    
    await expect(service.methodName(input)).rejects.toThrow('Failed');
  });
});
```

## Best Practices

### 1. **Mock External Dependencies**
Always mock database connections, external services, and other modules:

```typescript
const mockConnection = {
  query: jest.fn().mockResolvedValue({ rows: [] }),
};
```

### 2. **Clear Mocks After Each Test**
Prevent test pollution:

```typescript
afterEach(() => {
  jest.clearAllMocks();
});
```

### 3. **Test Both Success and Failure Cases**
```typescript
it('should succeed when...', () => { /* success test */ });
it('should fail when...', () => { /* failure test */ });
it('should handle edge case...', () => { /* edge case */ });
```

### 4. **Use Descriptive Test Names**
```typescript
// ❌ Bad
it('works', () => { });

// ✅ Good
it('should return access token when login is successful', () => { });
```

### 5. **Arrange-Act-Assert Pattern**
```typescript
it('should do something', () => {
  // Arrange - Set up test data and mocks
  const input = 'test';
  mockService.method.mockReturnValue('result');

  // Act - Execute the code being tested
  const result = service.doSomething(input);

  // Assert - Verify the results
  expect(result).toBe('result');
});
```

### 6. **Test One Thing Per Test**
Each test should focus on a single behavior:

```typescript
// ❌ Bad - Testing multiple things
it('should login and create post', () => { });

// ✅ Good - Separate tests
it('should login successfully', () => { });
it('should create post after login', () => { });
```

### 7. **Use Proper Matchers**
```typescript
expect(value).toBe(primitive);           // For primitives
expect(value).toEqual(object);           // For objects/arrays
expect(value).toHaveBeenCalled();        // For mock functions
expect(value).toHaveBeenCalledWith(arg); // For mock with args
expect(async).rejects.toThrow();         // For async errors
expect(value).toBeDefined();             // For existence
expect(value).toBeNull();                // For null
expect(array).toHaveLength(n);           // For array length
```

### 8. **Mock Console Methods During Tests**
```typescript
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

// ... test code ...

consoleErrorSpy.mockRestore();
```

## Test Results

Current test suite results:

```
Test Suites: 3 passed, 3 total
Tests:       31 passed, 31 total
Snapshots:   0 total
```

### Coverage Areas

- ✅ Authentication Service (9 tests)
- ✅ App Controller (15 tests)
- ✅ Users Service (7 tests)

## Debugging Tests

### Run Single Test
```bash
npm test -- --testPathPattern=auth.service.spec.ts --testNamePattern="should return user"
```

### Enable Verbose Output
```bash
npm test -- --verbose
```

### Debug with Node Inspector
```bash
npm run test:debug
```

Then open `chrome://inspect` in Chrome and attach to the Node process.

## Continuous Integration

Tests are typically run in CI/CD pipelines:

```yaml
# Example CI configuration
test:
  script:
    - cd apps/api
    - npm install
    - npm test
```

## Troubleshooting

### Common Issues

**Issue: Tests fail with "Cannot resolve dependencies"**
- Solution: Make sure all dependencies are properly mocked in the test module

**Issue: Tests pass locally but fail in CI**
- Solution: Check for environment-specific issues (timezones, async timing)

**Issue: Mock not being called**
- Solution: Verify the mock is properly configured and `jest.clearAllMocks()` is called

**Issue: Async test timing out**
- Solution: Make sure to `await` async operations and return promises

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Last Updated**: January 2025
**Maintained by**: Adi Ginting
