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

interface FeatureAnnouncementEmailProps {
  companyName?: string;
  featureName?: string;
  description?: string;
  url?: string;
}

export const FeatureAnnouncementEmail = ({
  companyName = "PulseGuard",
  featureName = "{{.FeatureName}}",
  description = "{{.Description}}",
  url = "{{.URL}}",
}: FeatureAnnouncementEmailProps) => {
  return (
    <Tailwind config={barebonesBoxedTailwindConfig}>
      <Html>
        <Head>
          <BarebonesFonts />
        </Head>
        <Preview>Introducing: {featureName}</Preview>
        <Body className="bg-bg-1 m-0 py-10 px-4 font-sans text-text-primary">
          <Container className="max-w-[480px] bg-bg-2 border border-border rounded-lg p-8 mx-auto shadow-sm">
            <Section className="mb-6">
              <Heading className="text-sm font-bold text-text-primary m-0">
                New Feature: {featureName}
              </Heading>
            </Section>
            <Section className="mb-6">
              <Text className="text-xs leading-relaxed text-text-secondary m-0">
                We're excited to introduce a major update to {companyName}! Check out what's new:
              </Text>
              <Text className="text-xs leading-relaxed text-text-secondary mt-3 m-0">
                {description}
              </Text>
            </Section>
            <Section className="mb-6">
              <Button
                className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-md no-underline inline-block"
                href={url}
              >
                Learn More
              </Button>
            </Section>
            <Section className="border-t border-border pt-4">
              <Text className="text-[10px] leading-relaxed text-text-muted m-0">
                You're receiving this because you are a registered user of {companyName}. To update your notification preferences, visit your settings.
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

export default FeatureAnnouncementEmail;
