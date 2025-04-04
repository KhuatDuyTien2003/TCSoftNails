using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NailsTcsoft3.Migrations
{
    /// <inheritdoc />
    public partial class AddWork : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "WorkDate",
                table: "WorkSchedule",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WorkDate",
                table: "WorkSchedule");
        }
    }
}
