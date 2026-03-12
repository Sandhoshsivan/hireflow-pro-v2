using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HireFlowPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddResumeProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ResumeProfiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    FullName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Summary = table.Column<string>(type: "TEXT", nullable: true),
                    Skills = table.Column<string>(type: "TEXT", nullable: true),
                    Experience = table.Column<string>(type: "TEXT", nullable: true),
                    Education = table.Column<string>(type: "TEXT", nullable: true),
                    Certifications = table.Column<string>(type: "TEXT", nullable: true),
                    Languages = table.Column<string>(type: "TEXT", nullable: true),
                    Phone = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    Location = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    LinkedIn = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Portfolio = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResumeProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResumeProfiles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ResumeProfiles_UserId",
                table: "ResumeProfiles",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ResumeProfiles");
        }
    }
}
