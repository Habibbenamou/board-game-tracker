import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

import { supabase } from "./supabase";

const BUCKET_NAME = "game-images";

/**
 * Upload a game image to Supabase Storage.
 *
 * Every upload gets a unique filename.
 *
 * This is important when editing an existing game:
 * we don't overwrite the previous Storage object.
 * Instead, we upload a new object, update the database
 * with its URL, and then delete the old object.
 */
export async function uploadGameImage(
  gameId: string,
  imageUri: string
): Promise<string> {
  try {
    const extension =
      imageUri
        .split(".")
        .pop()
        ?.split("?")[0]
        ?.toLowerCase() || "jpg";

    /*
     * Generate a unique filename.
     *
     * Example:
     * 123-game-id/8f3a2c1d.jpg
     *
     * Using a folder per game keeps Storage organized
     * while ensuring every replacement gets a new path.
     */
    const uniqueId =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}`;

    const filePath =
      `${gameId}/${uniqueId}.${extension}`;

    let arrayBuffer: ArrayBuffer;

    if (Platform.OS === "web") {
      const response =
        await fetch(imageUri);

      if (!response.ok) {
        throw new Error(
          "Unable to read selected image."
        );
      }

      arrayBuffer =
        await response.arrayBuffer();
    } else {
      /*
       * Expo FileSystem does not directly provide
       * an ArrayBuffer in the API we're using here,
       * so read the local file as base64 and decode it.
       */
      const base64 =
        await FileSystem.readAsStringAsync(
          imageUri,
          {
            encoding:
              FileSystem.EncodingType.Base64,
          }
        );

      arrayBuffer = decode(base64);
    }

    const { error } =
      await supabase.storage
        .from(BUCKET_NAME)
        .upload(
          filePath,
          arrayBuffer,
          {
            contentType:
              getContentType(extension),
            upsert: false,
          }
        );

    if (error) {
      console.error(
        "Error uploading game image:",
        error
      );

      throw error;
    }

    const { data } =
      supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error(
      "Error uploading game image:",
      error
    );

    throw error;
  }
}

function getContentType(
  extension: string
): string {
  switch (extension) {
    case "png":
      return "image/png";

    case "webp":
      return "image/webp";

    case "gif":
      return "image/gif";

    case "jpg":
    case "jpeg":
    default:
      return "image/jpeg";
  }
}

/**
 * Delete a game image from Supabase Storage.
 *
 * Accepts the public URL stored in games.image_url
 * and converts it into the Storage path expected by
 * Supabase's remove() method.
 */
export async function deleteGameImage(
  imageUrl: string
): Promise<void> {
  try {
    if (!imageUrl) {
      return;
    }

    const filePath =
      getStorageFilePath(imageUrl);

    if (!filePath) {
      console.warn(
        "Unable to determine Storage path from image URL:",
        imageUrl
      );

      return;
    }

    const { error } =
      await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

    if (error) {
      console.error(
        "Error deleting game image:",
        error
      );

      throw error;
    }
  } catch (error) {
    console.error(
      "Error deleting game image:",
      error
    );

    throw error;
  }
}

/**
 * Convert a Supabase public Storage URL into
 * the path inside the bucket.
 *
 * Example:
 *
 * https://xxxxx.supabase.co/storage/v1/object/public/game-images/123/abc.jpg
 *
 * becomes:
 *
 * 123/abc.jpg
 */
function getStorageFilePath(
  imageUrl: string
): string | null {
  try {
    /*
     * If the value is already a Storage path,
     * don't modify it.
     */
    if (
      !imageUrl.startsWith("http://") &&
      !imageUrl.startsWith("https://")
    ) {
      return imageUrl;
    }

    const marker =
      `/storage/v1/object/public/${BUCKET_NAME}/`;

    const markerIndex =
      imageUrl.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return imageUrl.substring(
      markerIndex + marker.length
    );
  } catch (error) {
    console.error(
      "Error parsing game image URL:",
      error
    );

    return null;
  }
}