import { errorToString, exclude } from "@/lib/utils";
import { LoadAPIKeyError, UIMessagePart } from "ai";
import logger from "logger";
import { safe } from "ts-safe";

export function handleError(error: any) {
  if (LoadAPIKeyError.isInstance(error)) {
    return error.message;
  }
  logger.error('Handle Error:', error);
  logger.error(`Route Error: ${error.name}`);
  return errorToString(error.message);
}

export const convertToSavePart = <T extends UIMessagePart<any, any>>(
  part: T,
) => {
  return safe(
    exclude(part as any, ["providerMetadata", "callProviderMetadata"]) as T,
  )
    .map((v) => {
      return v;
    })
    .unwrap();
};