using System;
using Microsoft.AspNetCore.Http;

namespace API.Helpers
{
    public static class Extensions
    {
        public static void AddApplicationError(this HttpResponse response, string message)
        {
            response.Headers.Add("Application-Error", message);
        }

        public static int CalculateAge(this DateTime dob)
        {
            var age = DateTime.Now.Year - dob.Year;

            if(dob.AddYears(age) > DateTime.Now) age--;

            return age;
        }
    }
}