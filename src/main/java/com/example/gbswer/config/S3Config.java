package com.example.gbswer.config;

import com.example.gbswer.config.properties.AwsProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "file", name = "type", havingValue = "s3")
public class S3Config {

    private final AwsProperties awsProperties;

    @Bean
    @ConditionalOnExpression("'${file.type:}'=='s3' and '${aws.s3.access-key:}' != '' and '${aws.s3.secret-key:}' != ''")
    public S3Client s3Client() {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(
                awsProperties.getAccessKey(),
                awsProperties.getSecretKey()
        );
        return S3Client.builder()
                .region(Region.of(awsProperties.getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
    }
}
