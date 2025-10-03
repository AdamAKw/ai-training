package org.household;

import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.infrastructure.Infrastructure;
import java.time.Duration;
import org.junit.jupiter.api.Test;

public class MutinyTest {

    @Test
    void test() {
        Uni.createFrom()
            .item(this::invokeRemoteServiceUsingBlockingIO)
            .runSubscriptionOn(Infrastructure.getDefaultWorkerPool())
            .subscribe().with(System.out::println);

    }


    String invokeRemoteServiceUsingBlockingIO() {
        return "test";
    }

}
