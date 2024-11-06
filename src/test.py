import pygame
import random

# Initialize Pygame
pygame.init()

# Set up the game window
width, height = 800, 600
screen = pygame.display.set_mode((width, height))
pygame.display.set_caption("Platformer Game")

# Define colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)

# Define game objects
player_size = 50
player_pos = [width // 2, height - 2 * player_size]
enemy_size = 50
enemy_pos = [random.randint(0, width - enemy_size), 0]
enemy_list = [enemy_pos]
island_width, island_height = 100, 20
island_list = [[random.randint(0, width - island_width), random.randint(100, height - 100)] for _ in range(5)]

# Set up game variables
speed = 5
score = 0
clock = pygame.time.Clock()

# Game loop
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT] and player_pos[0] > 0:
        player_pos[0] -= speed
    if keys[pygame.K_RIGHT] and player_pos[0] < width - player_size:
        player_pos[0] += speed

    screen.fill(BLACK)

    # Draw the player
    pygame.draw.rect(screen, WHITE, (player_pos[0], player_pos[1], player_size, player_size))

    # Draw the enemies
    for enemy_pos in enemy_list:
        pygame.draw.rect(screen, RED, (enemy_pos[0], enemy_pos[1], enemy_size, enemy_size))

    # Draw the islands
    for island_pos in island_list:
        pygame.draw.rect(screen, WHITE, (island_pos[0], island_pos[1], island_width, island_height))

    # Update enemy positions
    for idx, enemy_pos in enumerate(enemy_list):
        if enemy_pos[1] >= 0 and enemy_pos[1] < height:
            enemy_pos[1] += speed
        else:
            enemy_list.pop(idx)
            score += 1

    # Spawn new enemies
    if len(enemy_list) < 5:
        x_pos = random.randint(0, width - enemy_size)
        y_pos = 0
        enemy_list.append([x_pos, y_pos])

    # Check for collision with enemies
    for enemy_pos in enemy_list:
        if player_pos[1] < enemy_pos[1] + enemy_size and player_pos[1] + player_size > enemy_pos[1]:
            if player_pos[0] < enemy_pos[0] + enemy_size and player_pos[0] + player_size > enemy_pos[0]:
                running = False

    # Check for collision with islands
    for island_pos in island_list:
        if player_pos[1] < island_pos[1] + island_height and player_pos[1] + player_size > island_pos[1]:
            if player_pos[0] < island_pos[0] + island_width and player_pos[0] + player_size > island_pos[0]:
                player_pos[1] = island_pos[1] - player_size

    pygame.display.flip()
    clock.tick(60)

# Quit the game
pygame.quit()