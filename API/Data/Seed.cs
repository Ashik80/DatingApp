using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using API.Models;
using Newtonsoft.Json;

namespace API.Data
{
    public class Seed
    {
        public static void SeedUsers(DataContext context)
        {
            if(!context.User.Any())
            {
                var userData = File.ReadAllText("Data/userSeedData.json");
                var users = JsonConvert.DeserializeObject<List<User>>(userData);

                foreach(var user in users)
                {
                    byte[] passwordHash, passwordSalt;
                    CreatePasswordHash("password", out passwordHash, out passwordSalt);

                    user.PasswordHash = passwordHash;
                    user.PasswordSalt = passwordSalt;
                    user.UserName = user.UserName.ToLower();

                    context.User.Add(user);
                }

                context.SaveChanges();
            }
        }

        private static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new System.Security.Cryptography.HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            }
        }
    }
}