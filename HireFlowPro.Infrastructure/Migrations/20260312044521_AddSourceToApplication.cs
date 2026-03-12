using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HireFlowPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSourceToApplication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Source",
                table: "Applications",
                type: "TEXT",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Source",
                table: "Applications");
        }
    }
}
