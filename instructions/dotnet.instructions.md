# .NET Instructions

## プロジェクト構成

```
src/
  <ProjectName>.Api/                 # エントリーポイント・コントローラー
    Controllers/
    Middlewares/
    Program.cs
    appsettings.json
  <ProjectName>.Application/         # ビジネスロジック・ユースケース
    Features/
      <FeatureName>/
        Commands/
        Queries/
        Handlers/
    DTOs/
    Interfaces/
  <ProjectName>.Domain/              # ドメインモデル・インターフェース
    Entities/
    ValueObjects/
    Exceptions/
  <ProjectName>.Infrastructure/      # DB・外部サービス実装
    Persistence/
      Migrations/
      Configurations/
      AppDbContext.cs
    Repositories/
tests/
  <ProjectName>.UnitTests/           # xUnit ユニットテスト
  <ProjectName>.IntegrationTests/    # xUnit 統合テスト
```

## コーディング規約

### 全般

- `nullable reference types` を有効にする（`<Nullable>enable</Nullable>`）
- `implicit usings` を有効にする（`<ImplicitUsings>enable</ImplicitUsings>`）
- `TreatWarningsAsErrors` を有効にすることを推奨する
- ターゲットフレームワークは `net9.0` を使用する

### 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| クラス / インターフェース | PascalCase | `UserService`, `IUserRepository` |
| メソッド | PascalCase | `GetUserAsync` |
| プロパティ | PascalCase | `UserName` |
| プライベートフィールド | _camelCase | `_userRepository` |
| ローカル変数 | camelCase | `userId` |
| 定数 | PascalCase | `MaxRetryCount` |

### DTO は record 型を使用

```csharp
public record CreateUserRequest(
    string Name,
    string Email
);

public record UserResponse(
    Guid Id,
    string Name,
    string Email,
    DateTimeOffset CreatedAt
);
```

### async/await

```csharp
// Good
public async Task<UserResponse> GetUserAsync(Guid id, CancellationToken ct = default)
{
    var user = await _repository.FindByIdAsync(id, ct);
    return user is null ? null : MapToResponse(user);
}

// Bad — 使用禁止
public UserResponse GetUser(Guid id)
{
    return _repository.FindByIdAsync(id).Result; // デッドロックの原因
}
```

### 例外処理

- ドメイン固有の例外は `Domain/Exceptions/` に定義する
- コントローラーで直接 try-catch しない
- グローバル例外ハンドラー（ミドルウェア）で `ProblemDetails` 形式で返す

```csharp
// Domain/Exceptions/NotFoundException.cs
public sealed class NotFoundException(string message) : Exception(message);

// Api/Middlewares/GlobalExceptionHandler.cs
public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext ctx, Exception ex, CancellationToken ct)
    {
        logger.LogError(ex, "Unhandled exception");

        var problem = ex switch
        {
            NotFoundException => new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Not Found",
                Detail = ex.Message
            },
            _ => new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal Server Error"
            }
        };

        ctx.Response.StatusCode = problem.Status!.Value;
        await ctx.Response.WriteAsJsonAsync(problem, ct);
        return true;
    }
}
```

## ASP.NET Core Web API

### コントローラーパターン

```csharp
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class UsersController(IUserService userService) : ControllerBase
{
    /// <summary>ユーザーを取得する</summary>
    /// <param name="id">ユーザー ID</param>
    [HttpGet("{id:guid}")]
    [ProducesResponseType<UserResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserResponse>> GetAsync(Guid id, CancellationToken ct)
    {
        var user = await userService.GetByIdAsync(id, ct);
        return user is null ? NotFound() : Ok(user);
    }
}
```

### Program.cs 構成

```csharp
var builder = WebApplication.CreateBuilder(args);

// サービス登録
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// 依存性注入
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();

// Entity Framework Core
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

## Entity Framework Core

### DbContext

```csharp
public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
```

### エンティティ設定

```csharp
public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Name).HasMaxLength(100).IsRequired();
        builder.Property(u => u.Email).HasMaxLength(256).IsRequired();
        builder.HasIndex(u => u.Email).IsUnique();
    }
}
```

### クエリパターン

```csharp
// 読み取り専用クエリには AsNoTracking を使用
var users = await _context.Users
    .AsNoTracking()
    .Where(u => u.IsActive)
    .ToListAsync(ct);

// N+1 を避けるため Include を明示
var order = await _context.Orders
    .Include(o => o.Items)
        .ThenInclude(i => i.Product)
    .FirstOrDefaultAsync(o => o.Id == id, ct);
```

## テスト — xUnit

### テストプロジェクト設定（csproj）

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <IsPackable>false</IsPackable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="xunit" Version="2.9.3" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.8.2" />
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.12.0" />
    <PackageReference Include="Moq" Version="4.20.72" />
    <PackageReference Include="FluentAssertions" Version="6.12.2" />
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="9.0.0" />
  </ItemGroup>
</Project>
```

### ユニットテストパターン

```csharp
public class UserServiceTests
{
    private readonly Mock<IUserRepository> _repositoryMock = new();
    private readonly UserService _sut;

    public UserServiceTests()
    {
        _sut = new UserService(_repositoryMock.Object);
    }

    [Fact]
    public async Task GetByIdAsync_WhenUserExists_ShouldReturnUserResponse()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User { Id = userId, Name = "Alice", Email = "alice@example.com" };
        _repositoryMock.Setup(r => r.FindByIdAsync(userId, default)).ReturnsAsync(user);

        // Act
        var result = await _sut.GetByIdAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(userId);
        result.Name.Should().Be("Alice");
    }

    [Fact]
    public async Task GetByIdAsync_WhenUserNotFound_ShouldReturnNull()
    {
        // Arrange
        _repositoryMock.Setup(r => r.FindByIdAsync(It.IsAny<Guid>(), default))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _sut.GetByIdAsync(Guid.NewGuid());

        // Assert
        result.Should().BeNull();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task CreateAsync_WhenNameIsEmpty_ShouldThrowArgumentException(string? name)
    {
        // Arrange
        var request = new CreateUserRequest(name!, "valid@example.com");

        // Act
        var act = () => _sut.CreateAsync(request);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*name*");
    }
}
```

### 統合テストパターン（WebApplicationFactory）

```csharp
public class UsersControllerTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task GetUser_WhenExists_Returns200WithBody()
    {
        // Arrange
        var userId = Guid.NewGuid();
        // 必要に応じて DB にシードデータを投入する

        // Act
        var response = await _client.GetAsync($"/api/users/{userId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<UserResponse>();
        body.Should().NotBeNull();
        body!.Id.Should().Be(userId);
    }

    [Fact]
    public async Task GetUser_WhenNotFound_Returns404()
    {
        var response = await _client.GetAsync($"/api/users/{Guid.NewGuid()}");
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
```

### テスト命名規則

- **形式**: `MethodName_WhenCondition_ShouldExpectedBehavior`
- `[Fact]` — 単一条件のテスト
- `[Theory]` + `[InlineData]` — 複数の入力値を使うパラメーター化テスト
- AAA（Arrange / Act / Assert）コメントで構造を明示する

## セキュリティ

- 認証は `Microsoft.AspNetCore.Authentication.JwtBearer` を使用する
- API キーは `IConfiguration` + Azure Key Vault から取得する
- ユーザー入力は `FluentValidation` または DataAnnotations でバリデーションする
- SQL インジェクション対策は EF Core のパラメーター化クエリが自動的に行う
- CORS ポリシーを明示的に設定する（`AllowAnyOrigin` は使用しない）

## テスト実行コマンド

```bash
# 全テスト実行
dotnet test

# 特定プロジェクトのテスト
dotnet test tests/<ProjectName>.UnitTests/

# カバレッジレポート付き
dotnet test --collect:"XPlat Code Coverage"
```
