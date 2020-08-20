using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Data;
using API.Dtos;
using API.Helpers;
using API.Models;
using AutoMapper;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace API.Controllers
{
    [Route("api/users/{userId}/photos")]
    [ApiController]
    public class PhotosController : ControllerBase
    {
        private readonly IDatingRepository repo;
        private readonly IMapper mapper;
        private readonly IOptions<CloudinarySettings> cloudinaryConfig;
        private Cloudinary cloudinary;

        public PhotosController(IDatingRepository repo, IMapper mapper,
            IOptions<CloudinarySettings> cloudinaryConfig)
        {
            this.cloudinaryConfig = cloudinaryConfig;
            this.mapper = mapper;
            this.repo = repo;

            Account account = new Account(
                cloudinaryConfig.Value.CloudName,
                cloudinaryConfig.Value.ApiKey,
                cloudinaryConfig.Value.ApiSecret
            );

            cloudinary = new Cloudinary(account);
        }

        [HttpGet("{id}", Name = "GetPhoto")]
        public async Task<IActionResult> GetPhoto(int id)
        {
            var photoFromRepo = await repo.GetPhoto(id);

            var photo = mapper.Map<PhotoToReturnDto>(photoFromRepo);

            return Ok(photo);
        }

        [HttpPost]
        public async Task<IActionResult> AddPhotoForUser(int userId, [FromForm] PhotoForCreationDto creationDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var userFromRepo = await repo.GetUser(userId);

            var file = creationDto.File;

            var uploadResult = new ImageUploadResult();

            if (file.Length > 0)
            {
                using (var stream = file.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams
                    {
                        File = new FileDescription(file.Name, stream),
                        Transformation = new Transformation().Width(500).Height(500).Crop("fill").Gravity("face")
                    };

                    uploadResult = cloudinary.Upload(uploadParams);
                }
            }

            creationDto.PublicId = uploadResult.PublicId;
            creationDto.Url = uploadResult.SecureUrl.AbsoluteUri;

            var photo = mapper.Map<Photo>(creationDto);

            if (!userFromRepo.Photos.Any(x => x.IsMain))
            {
                photo.IsMain = true;
            }

            userFromRepo.Photos.Add(photo);

            if (await repo.SaveAll())
            {
                var photoToReturn = mapper.Map<PhotoToReturnDto>(photo);
                return CreatedAtRoute("GetPhoto", new { userId = userId, id = photo.Id }, photoToReturn);
            }

            return BadRequest("Could not add the photo");
        }

        [HttpPost("{id}/setMain")]
        public async Task<IActionResult> SetMainPhoto(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var user = await repo.GetUser(userId);

            if (!user.Photos.Any(p => p.Id == id)) return Unauthorized();

            var photoFromRepo = await repo.GetPhoto(id);

            if (photoFromRepo.IsMain) return BadRequest("This is already the main photo");

            var currentMainPhoto = await repo.GetMainPhotoForUser(userId);

            currentMainPhoto.IsMain = false;

            photoFromRepo.IsMain = true;

            if (await repo.SaveAll()) return NoContent();

            return BadRequest("Could not set photo to main");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhoto(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var user = await repo.GetUser(userId);

            if (!user.Photos.Any(p => p.Id == id)) return Unauthorized();

            var photoFromRepo = await repo.GetPhoto(id);

            if (photoFromRepo.IsMain) return BadRequest("You cannot delete your main photo");

            if (photoFromRepo.PublicId != null)
            {
                var deleteParams = new DeletionParams(photoFromRepo.PublicId);

                var result = cloudinary.Destroy(deleteParams);

                if (result.Result == "ok")
                {
                    repo.Delete(photoFromRepo);
                }
            }

            if (photoFromRepo.PublicId == null)
            {
                repo.Delete(photoFromRepo);
            }

            if (await repo.SaveAll()) return Ok();

            return BadRequest("Failed to delete photo");
        }

    }
}