import { logger } from "@/lib/logger";

interface SignatureRequest {
  documentTitle: string;
  signerName: string;
  signerEmail: string;
  /** Base64-encoded PDF or URL to the document */
  documentUrl?: string;
  documentBase64?: string;
  /** Callback URL when signing is complete */
  callbackUrl?: string;
}

interface SignatureResult {
  success: boolean;
  /** External signing URL to redirect the signer to */
  signingUrl?: string;
  /** External envelope/request ID */
  externalId?: string;
  error?: string;
}

interface ESignatureProvider {
  createSignatureRequest(request: SignatureRequest): Promise<SignatureResult>;
  getStatus(externalId: string): Promise<{ status: string; signedAt?: string }>;
}

/**
 * DocuSign eSignature provider.
 *
 * Requires env vars:
 *   DOCUSIGN_INTEGRATION_KEY
 *   DOCUSIGN_SECRET_KEY
 *   DOCUSIGN_ACCOUNT_ID
 *   DOCUSIGN_BASE_URL  (e.g. https://demo.docusign.net/restapi for sandbox)
 */
class DocuSignProvider implements ESignatureProvider {
  private baseUrl: string;
  private accountId: string;

  constructor() {
    this.baseUrl = process.env.DOCUSIGN_BASE_URL || "https://demo.docusign.net/restapi";
    this.accountId = process.env.DOCUSIGN_ACCOUNT_ID || "";
  }

  private async getAccessToken(): Promise<string> {
    // In production, implement JWT grant or authorization code grant
    // For now, use the access token directly from env
    const token = process.env.DOCUSIGN_ACCESS_TOKEN;
    if (!token) throw new Error("DocuSign access token not configured");
    return token;
  }

  async createSignatureRequest(request: SignatureRequest): Promise<SignatureResult> {
    try {
      const token = await this.getAccessToken();

      const envelopeDefinition = {
        emailSubject: `Please sign: ${request.documentTitle}`,
        documents: [
          {
            documentBase64: request.documentBase64 || "",
            name: request.documentTitle,
            fileExtension: "pdf",
            documentId: "1",
          },
        ],
        recipients: {
          signers: [
            {
              email: request.signerEmail,
              name: request.signerName,
              recipientId: "1",
              routingOrder: "1",
              tabs: {
                signHereTabs: [
                  {
                    documentId: "1",
                    pageNumber: "1",
                    xPosition: "100",
                    yPosition: "700",
                  },
                ],
              },
            },
          ],
        },
        status: "sent",
      };

      const response = await fetch(
        `${this.baseUrl}/v2.1/accounts/${this.accountId}/envelopes`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(envelopeDefinition),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `DocuSign error ${response.status}`);
      }

      const data = await response.json();

      logger.info("DocuSign envelope created", {
        envelopeId: data.envelopeId,
        signerEmail: request.signerEmail,
      });

      return {
        success: true,
        externalId: data.envelopeId,
        signingUrl: data.uri,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error("DocuSign create failed", {}, error);
      return { success: false, error: error.message };
    }
  }

  async getStatus(externalId: string): Promise<{ status: string; signedAt?: string }> {
    const token = await this.getAccessToken();

    const response = await fetch(
      `${this.baseUrl}/v2.1/accounts/${this.accountId}/envelopes/${externalId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();
    return {
      status: data.status,
      signedAt: data.completedDateTime || undefined,
    };
  }
}

/**
 * Built-in eSignature provider using RegsGuard's internal signing flow.
 * Generates a signed URL for the signer to view and sign the document.
 */
class InternalProvider implements ESignatureProvider {
  async createSignatureRequest(request: SignatureRequest): Promise<SignatureResult> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // The signing URL uses the existing Signature model's token-based flow
    // The actual token creation happens at the API route level
    logger.info("Internal signature request created", {
      signerEmail: request.signerEmail,
      document: request.documentTitle,
    });

    return {
      success: true,
      signingUrl: `${appUrl}/sign`, // Will be replaced with actual token URL
      externalId: `internal_${Date.now()}`,
    };
  }

  async getStatus(externalId: string): Promise<{ status: string; signedAt?: string }> {
    return { status: externalId.startsWith("internal_") ? "pending" : "unknown" };
  }
}

/**
 * Get the configured eSignature provider.
 * Uses DocuSign if configured, otherwise falls back to the internal signing flow.
 */
export function getESignatureProvider(): ESignatureProvider {
  if (process.env.DOCUSIGN_INTEGRATION_KEY && process.env.DOCUSIGN_ACCOUNT_ID) {
    return new DocuSignProvider();
  }
  return new InternalProvider();
}
