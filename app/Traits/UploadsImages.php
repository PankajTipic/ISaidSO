<?php

namespace App\Traits;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

trait UploadsImages
{
    private function saveBase64ImageToS3($imageInput, $folder)
    {
        if (!$imageInput) {
            return null;
        }

        // If it's already a path (not base64), return as is
        if (strpos($imageInput, 'data:image/') !== 0) {
            return $imageInput;
        }

        if (preg_match('/^data:image\/(\w+);base64,/', $imageInput, $type)) {
            $extension = strtolower($type[1]);
            if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                return null;
            }

            $imageData = substr($imageInput, strpos($imageInput, ',') + 1);
            $imageData = base64_decode($imageData);

            if ($imageData === false) {
                return null;
            }

            $fileName = $folder . '_' . date('His') . '-' . Str::random(10) . '.' . $extension;

            // 1. Try S3 Upload
            try {
                $envPrefix = env('ENVIRONMENT_PREFIX', 'unknown');
                // Path: isaidso/img/{env}/{folder}/{filename}
                $s3Path = "isaidso/img/{$envPrefix}/{$folder}/{$fileName}";
                
                Storage::disk('s3')->put($s3Path, $imageData, 'private'); // Store as private

                return $s3Path; // Success: return S3 Path
            } catch (\Throwable $e) {
                Log::error("S3 Upload Failed for {$folder}. Error: " . $e->getMessage());
                // Throw exception to let the user know upload failed, or return null.
                // Given the requirement is "don't use server", failing is better than silently using server.
                throw $e; 
            }
        }

        return null;
    }
}
