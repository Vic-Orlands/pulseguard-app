import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { barebonesBoxedTailwindConfig } from "./theme";
import { BarebonesFonts } from "./theme-fonts";

interface ProductUpdateEmailProps {
  companyName?: string;
  updateTitle?: string;
  bodyContent?: string;
  url?: string;
}

export const ProductUpdateEmail = ({
  companyName = "PulseGuard",
  updateTitle = "{{.UpdateTitle}}",
  bodyContent = "{{.BodyContent}}",
  url = "{{.URL}}",
}: ProductUpdateEmailProps) => {
  return (
    <Tailwind config={barebonesBoxedTailwindConfig}>
      <Html>
        <Head>
          <BarebonesFonts />
        </Head>
        <Preview>Monthly Product Update: {updateTitle}</Preview>
        <Body className="bg-bg-1 m-0 py-10 px-4 font-sans text-text-primary">
          <Container className="max-w-[480px] bg-bg-2 border border-border rounded-lg p-8 mx-auto shadow-sm">
            <Section className="mb-6">
              <Heading className="text-sm font-bold text-text-primary m-0">
                Product Update: {updateTitle}
              </Heading>
            </Section>
            <Section className="mb-6">
              <Text className="text-xs leading-relaxed text-text-secondary m-0">
                Here's a digest of recent improvements and changes we've shipped this month:
              </Text>
              <Text className="text-xs leading-relaxed text-text-secondary mt-3 m-0">
                {bodyContent}
              </Text>
            </Section>
            <Section className="mb-6">
              <Button
                className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-md no-underline inline-block"
                href={url}
              >
                Read Release Notes
              </Button>
            </Section>
            <Section className="border-t border-border pt-4">
              <Text className="text-[10px] leading-relaxed text-text-muted m-0">
                You're receiving this because you are a registered user of {companyName}. To unsubscribe, update your settings in the app.
              </Text>
            </Section>
          </Container>
          <Text className="text-center text-[10px] text-text-muted mt-6 m-0">
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </Text>
        </Body>
      </Html>
    </Tailwind>
  );
};

export default ProductUpdateEmail;
