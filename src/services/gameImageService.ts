import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

import { supabase } from "./supabase";

const BUCKET_NAME = "game-images";

// The uploadGameImage arguments should match the call to uploadGameImage in src/app/add-game.tsx
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

    const filePath =
      `${gameId}.${extension}`;

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
        // Read the image file as a base64 string and convert it to an ArrayBuffer
        // This is necessary because Expo's FileSystem API does not provide a direct way to get an ArrayBuffer
        // Android and IOS handle file URIs differently, so we need to use the FileSystem API to read the file content
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
            upsert: true,
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

export async function deleteGameImage(
  imageUrl: string
): Promise<void> {
  try {

    const filePath = imageUrl;

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